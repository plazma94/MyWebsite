/* player.preload-window.js (robust version)
   Enhances existing player.js (async catch-up + reverse chain) WITHOUT modifying its core logic.

   Features:
   - Dynamic preload window (current scene +/- ranges).
   - Mid-progress priming of next scene using requestVideoFrameCallback if available.
   - Safe guards against early initialization (no crashes if player not ready yet).

   Configuration knobs below.
*/
(() => {
  const CONFIG = {
    PRELOAD_AHEAD: 2,
    PRELOAD_BEHIND: 1,
    PRIME_THRESHOLD: 0.50,          // progress ratio to prime next forward video
    UPDATE_INTERVAL_MS: 2000,
    LOG: false
  };

  const PRIME_FLAG = '__primedForward';

  function log(...a){
    if(CONFIG.LOG) try { console.log('[preload]', ...a); } catch(e){}
  }

  function getDebug(){
    return window.__videoPlayerDebug || null;
  }
  function getForwardArray(){
    const dbg = getDebug();
    return dbg && Array.isArray(dbg.forwardVideos) ? dbg.forwardVideos : [];
  }
  function getReverseArray(){
    const dbg = getDebug();
    return dbg && Array.isArray(dbg.reverseVideos) ? dbg.reverseVideos : [];
  }

  function currentScene(){
    try {
      if(window.videoPlayerControl && typeof window.videoPlayerControl.currentScene === 'function'){
        return window.videoPlayerControl.currentScene();
      }
    } catch(e){}
    return -1;
  }

  function setPreload(v, mode){
    if(!v) return;
    try { if(v.preload !== mode) v.preload = mode; } catch(e){}
  }

  function updatePreloadWindow(){
    const cur = currentScene();
    const forward = getForwardArray();
    const reverse = getReverseArray();
    if(forward.length === 0) return; // nothing yet
    if(cur < 0 || cur >= forward.length) return;

    for(let i=0;i<forward.length;i++){
      const dist = i - cur;
      const f = forward[i];
      const r = reverse[i];

      if(dist === 0){
        setPreload(f,'auto');
        setPreload(r,'metadata');
      } else if(dist > 0 && dist <= CONFIG.PRELOAD_AHEAD){
        setPreload(f,'auto');
        setPreload(r,'metadata');
      } else if(dist < 0 && dist >= -CONFIG.PRELOAD_BEHIND){
        setPreload(f,'metadata');
        setPreload(r,'metadata');
      } else {
        setPreload(f,'metadata');    // keep basic info for quick reactivation
        setPreload(r,'none');        // reverse less likely needed far away
      }
    }
  }

  function primeNextIfNeeded(progress){
    if(!(progress >= CONFIG.PRIME_THRESHOLD)) return;
    const cur = currentScene();
    const forward = getForwardArray();
    if(forward.length === 0) return;
    const next = cur + 1;
    if(next >= forward.length) return;
    const v = forward[next];
    if(!v || v.dataset[PRIME_FLAG]) return;

    try {
      const p = v.play();
      if(p && typeof p.then === 'function'){
        p.then(()=>{
          try { v.pause(); v.currentTime = 0; } catch(e){}
          v.dataset[PRIME_FLAG] = '1';
          log('Primed next scene', next);
        }).catch(()=>{ /* silence */ });
      } else {
        try { v.pause(); v.currentTime = 0; } catch(e){}
        v.dataset[PRIME_FLAG] = '1';
        log('Primed next scene (sync)', next);
      }
    } catch(e){
      // ignore
    }
  }

  function installProgressWatcher(){
    // Use requestVideoFrameCallback if available, else periodic fallback.
    function rvfcLoop(){
      const cur = currentScene();
      const forward = getForwardArray();
      if(cur < 0 || cur >= forward.length){
        requestAnimationFrame(rvfcLoop);
        return;
      }
      const v = forward[cur];
      if(!v){
        requestAnimationFrame(rvfcLoop);
        return;
      }
      // If API missing, bail to fallback
      if(!('requestVideoFrameCallback' in HTMLVideoElement.prototype)){
        legacyFallback();
        return;
      }
      try {
        v.requestVideoFrameCallback(()=>{
          if(v.duration && v.duration > 0 && Number.isFinite(v.currentTime)){
            const ratio = v.currentTime / v.duration;
            if(ratio <= 1.2) { // guard against bogus values
              primeNextIfNeeded(ratio);
            }
          }
          rvfcLoop();
        });
      } catch(e){
        requestAnimationFrame(rvfcLoop);
      }
    }

    function legacyFallback(){
      // Poll every 600ms if no rVFC
      setInterval(()=>{
        const cur = currentScene();
        const forward = getForwardArray();
        if(cur < 0 || cur >= forward.length) return;
        const v = forward[cur];
        if(!v || !v.duration || v.duration <= 0) return;
        primeNextIfNeeded(v.currentTime / v.duration);
      }, 600);
    }

    rvfcLoop();
  }

  function safeInit(){
    // Wait until player API exists and there is at least one forward video
    if(!(window.videoPlayerControl && getForwardArray().length)){
      setTimeout(safeInit, 120);
      return;
    }
    log('Preload window initialized');
    updatePreloadWindow();
    installProgressWatcher();
    // Scheduled window updates
    setInterval(updatePreloadWindow, CONFIG.UPDATE_INTERVAL_MS);
    // Light reaction to scroll changes
    document.addEventListener('scroll', () => {
      updatePreloadWindow();
    }, { passive:true });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', safeInit, { once:true });
  } else {
    safeInit();
  }
})();