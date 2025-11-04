// player.v3.js
// Free-scroll asynchronous catch-up WITH reverse chain playback.
// Scroll logic is external (gated-scroll.js) which calls updateTargetScene().
//
// Behavior Summary:
//  - Forward: plays scene's forward video from t=0 until near-end threshold => marks forwardPassDone, starts tail loop.
//  - If user scrolls ahead: when current scene forwardPassDone, auto-advance sequentially until currentScene == targetScene.
//  - If user scrolls upward: abort current forward pass immediately and start a reverse chain:
//       currentScene.reverse plays fully -> move to previous scene -> play its reverse -> ... until target reached.
//  - If during reverse chain user scrolls further up: extend chain deeper.
//  - If user scrolls down while reverse chain is mid-pass: finish that reverse pass, then resume forward logic.
//  - Missing reverse video for a scene => skip animation, jump directly to previous scene.
//  - canAdvanceStrict() returns true only when current scene's forward pass completed (for optional gating UI).
//
// Configurable knobs in CONFIG.
//
// NOTE: Provide both forward and reverse <video> tags inside each .scene (except intro if you wish).
//       <div class="scene"><video class="scene-video forward" ...><video class="scene-video reverse" ...></div>
//
(() => {
  const CONFIG = {
    LOOP_SECONDS: 0.5,           // Length of tail loop
    LOOP_EPS: 0.03,              // Seek precision
    MIN_PLAYED_MS: 500,          // Ignore near-end detection until this time elapsed
    NEAR_END_CONSEC_FRAMES: 2,   // Frames of satisfying threshold before pass is "done"
    LOOP_DWELL_MS: 220,          // Delay before auto moving to next scene when catching up
    PRIME_PROGRESS: 0.50,        // When >= 50% of forward pass, prime next
    PLAY_RETRY_LIMIT: 2,
    PLAY_RETRY_DELAY_MS: 260,
    FALLBACK_DONE_RATIO: 0.90,   // If >90% and watcher failed, declare done
    DEBUG: false
  };

  // Intro scene index (apply special behavior: no tail loop after forward pass)
  const INTRO_INDEX = 0;

  const log = (...a)=>{ if(CONFIG.DEBUG) try{ console.log('[player]', ...a);}catch(e){} };

  function waitForCanPlay(v, timeout=2500){
    return new Promise(res=>{
      if(!v) return res(false);
      if(v.readyState>=2) return res(true);
      let done=false, to=null;
      const handler=()=>{ if(done) return; done=true; cleanup(); res(v.readyState>=2); };
      const cleanup=()=>{ ['canplay','canplaythrough','error'].forEach(ev=>{ try{ v.removeEventListener(ev,handler);}catch(e){} }); if(to) clearTimeout(to); };
      ['canplay','canplaythrough','error'].forEach(ev=>v.addEventListener(ev,handler,{once:true}));
      to=setTimeout(()=>{ if(done) return; done=true; cleanup(); res(v.readyState>=2); }, timeout);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sceneEls = Array.from(document.querySelectorAll('.video-stage .scene'));
    const n = sceneEls.length;
    if(!n) return;

    // Collect forward & reverse videos
    const forwardVideos = sceneEls.map(s=>s.querySelector('video.forward, video.scene-video.forward') || s.querySelector('video:not(.reverse)') || null);
    const reverseVideos = sceneEls.map(s=>s.querySelector('video.reverse') || null);

    // Per-scene tracking
    const durationsF = new Array(n).fill(null);
    const forwardPassDone = new Array(n).fill(false);
    const playStartedAt = new Array(n).fill(0);
    const nearEndHits = new Array(n).fill(0);
    const loopActive = new Array(n).fill(false);
    const loopRAF = new Array(n).fill(null);
    const primed = {};
    const revChainSkip = new Set(); // scenes without reverse file (to skip gracefully)

    // Global state
    let currentScene = -1;
    let targetScene = 0;
    let pendingForwardCatchup = false;
    let reverseChainActive = false;
    let reverseChainTarget = null;
    let autoAdvanceTimer = null;
    let activeDirection = 'forward'; // 'forward' | 'reverse'

    // Expose debug
    window.__videoPlayerDebug = {
      sceneEls, forwardVideos, reverseVideos,
      forwardPassDone,
      internal: {
        currentScene: ()=>currentScene,
        targetScene: ()=>targetScene,
        reverseChainActive: ()=>reverseChainActive,
        activeDirection: ()=>activeDirection
      }
    };

    // Initialize videos
    forwardVideos.forEach((v,i)=>{
      if(!v) return;
      try {
        v.muted=true; v.setAttribute('muted','');
        v.playsInline=true; v.setAttribute('playsinline','');
        v.preload='auto'; v.pause(); v.currentTime=0;
      }catch(e){}
      v.addEventListener('loadedmetadata',()=> durationsF[i]=Number.isFinite(v.duration)?v.duration:null, { once:true });

      // Intro forward video: ensure it does NOT loop; freeze on last frame when ended
      if (i === INTRO_INDEX) {
        try { v.loop = false; } catch(_) {}
        v.addEventListener('ended', ()=>{
          try {
            const d = v.duration || 0;
            if (d > 0) v.currentTime = Math.max(0, d - 0.05);
          } catch(_) {}
          try { v.pause(); } catch(_) {}
        });
      }
    });
    reverseVideos.forEach((v,i)=>{
      if(!v) return;
      try {
        v.muted=true; v.setAttribute('muted','');
        v.playsInline=true; v.setAttribute('playsinline','');
        v.preload='auto'; v.pause(); v.currentTime=0;
      }catch(e){}
      if(!v) revChainSkip.add(i);
    });

    // ---------- Core helpers ----------
    function setSceneActive(i){
      sceneEls.forEach((s,idx)=> s.classList.toggle('is-active', idx===i));
    }
    function activateForward(i){
      const f=forwardVideos[i], r=reverseVideos[i];
      if(r) r.classList.remove('active-play');
      if(f) f.classList.add('active-play');
    }
    function activateReverse(i){
      const f=forwardVideos[i], r=reverseVideos[i];
      if(f) f.classList.remove('active-play');
      if(r) r.classList.add('active-play');
    }
    function stopLoop(i){
      loopActive[i]=false;
      if(loopRAF[i]) { try{ cancelAnimationFrame(loopRAF[i]); }catch(e){} loopRAF[i]=null; }
    }
    function startLoop(i){
      // Special case: DO NOT tail-loop the intro scene
      if (i === INTRO_INDEX) {
        loopActive[i] = false;
        return;
      }
      const v=forwardVideos[i];
      const dur = durationsF[i] || (v && v.duration) || 0;
      if(!v || !(dur>0)) return;
      const loopStart = Math.max(0, dur - CONFIG.LOOP_SECONDS);
      stopLoop(i);
      loopActive[i]=true;
      function step(){
        if(!loopActive[i]) return;
        if(!v.paused && v.currentTime >= dur - CONFIG.LOOP_EPS){
          try { v.currentTime = loopStart; }catch(e){}
        }
        loopRAF[i]=requestAnimationFrame(step);
      }
      loopRAF[i]=requestAnimationFrame(step);
    }

    async function attemptPlay(v){
      for(let k=0;k<CONFIG.PLAY_RETRY_LIMIT;k++){
        try {
          const p=v.play();
            if(p && p.then){
            await p;
          }
          if(!v.paused) return true;
        }catch(e){}
        await new Promise(r=>setTimeout(r, CONFIG.PLAY_RETRY_DELAY_MS));
      }
      return !v.paused;
    }

    function showOverlay(i,v){
      const scene=sceneEls[i];
      if(!scene || !v) return;
      if(scene.querySelector('.play-overlay')) return;
      const btn=document.createElement('button');
      btn.className='play-overlay';
      btn.textContent='Tap to play';
      btn.addEventListener('click', async ()=>{
        try {
          await attemptPlay(v);
          if(!v.paused){
            btn.remove();
            if(activeDirection==='forward'){
              finalizeForwardStart(i);
            } else {
              finalizeReverseStart(i);
            }
          }
        }catch(e){}
      }, { once:true });
      scene.appendChild(btn);
    }

    function finalizeForwardStart(i){
      pauseOthersExcept(i,'forward');
      currentScene=i;
      setSceneActive(i);
      playStartedAt[i]=performance.now();
      monitorForwardProgress(i);
    }
    function finalizeReverseStart(i){
      pauseOthersExcept(i,'reverse');
      currentScene=i;
      setSceneActive(i);
    }

    function pauseOthersExcept(i, mode){
      for(let k=0;k<n;k++){
        if(k===i) continue;
        if(mode==='forward'){
          const fv=forwardVideos[k]; if(fv){ try { fv.pause(); }catch(e){} }
          const rv=reverseVideos[k]; if(rv){ try { rv.pause(); }catch(e){} }
        } else {
          const fv=forwardVideos[k]; if(fv){ try { fv.pause(); }catch(e){} }
          const rv=reverseVideos[k]; if(rv){ try { rv.pause(); }catch(e){} }
        }
        stopLoop(k);
      }
    }

    function monitorForwardProgress(i){
      if(forwardPassDone[i]) return;
      const v=forwardVideos[i]; if(!v) return;
      nearEndHits[i]=0;

      const useRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
      function computeThreshold(){
        const d = durationsF[i] || v.duration || 0;
        if(!(d>0)) return null;
        const t = d - CONFIG.LOOP_SECONDS - CONFIG.LOOP_EPS;
        return t>0.15 ? t : d*CONFIG.FALLBACK_DONE_RATIO;
      }
      let threshold = computeThreshold();
      if(threshold==null){
        setTimeout(()=>{ if(!forwardPassDone[i]) monitorForwardProgress(i); },120);
        return;
      }

      const markDone = (reason='normal')=>{
        if(forwardPassDone[i]) return;
        forwardPassDone[i]=true;
        document.body.classList.add('scene-ready');

        // Tail loop for all scenes EXCEPT intro
        if (i === INTRO_INDEX) {
          stopLoop(i);
          // Freeze intro on last frame and pause
          try {
            const d = v.duration || 0;
            if (d > 0) v.currentTime = Math.max(0, d - 0.05);
          } catch(_) {}
          try { v.pause(); } catch(_) {}
        } else {
          startLoop(i);
        }

        log('Forward pass done', i, reason);
        scheduleForwardCatchup();
      };

      if(useRVFC){
        const frameCheck=()=>{
          if(forwardPassDone[i]) return;
          if(!v.duration){ v.requestVideoFrameCallback(frameCheck); return; }
          const elapsed = performance.now() - playStartedAt[i];
          if(elapsed < CONFIG.MIN_PLAYED_MS){ v.requestVideoFrameCallback(frameCheck); return; }
          if(v.currentTime >= threshold){
            nearEndHits[i] = (nearEndHits[i]||0)+1;
            if(nearEndHits[i] >= CONFIG.NEAR_END_CONSEC_FRAMES){
              markDone('rvfc');
              return;
            }
          } else {
            nearEndHits[i]=0;
          }
          // Fallback if > 90%
          if(!forwardPassDone[i] && v.duration && (v.currentTime / v.duration) >= CONFIG.FALLBACK_DONE_RATIO){
            markDone('fallback90');
            return;
          }
          v.requestVideoFrameCallback(frameCheck);
        };
        v.requestVideoFrameCallback(frameCheck);
      } else {
        const interval = setInterval(()=>{
          if(forwardPassDone[i]){ clearInterval(interval); return; }
          if(!v.duration) return;
          const elapsed = performance.now() - playStartedAt[i];
          if(elapsed < CONFIG.MIN_PLAYED_MS) return;
          if(v.currentTime >= threshold){
            nearEndHits[i]=(nearEndHits[i]||0)+1;
            if(nearEndHits[i] >= CONFIG.NEAR_END_CONSEC_FRAMES){
              clearInterval(interval);
              markDone('timeupdate');
              return;
            }
          } else {
            nearEndHits[i]=0;
          }
          if(!forwardPassDone[i] && (v.currentTime / v.duration) >= CONFIG.FALLBACK_DONE_RATIO){
            clearInterval(interval);
            markDone('fallback90');
          }
        }, 120);
      }
    }

    async function playForward(i){
      const v=forwardVideos[i]; if(!v) return;
      activeDirection='forward';
      await waitForCanPlay(v,2200);
      try { v.pause(); v.currentTime=0; }catch(e){}
      activateForward(i);
      const ok = await attemptPlay(v);
      if(!ok){
        log('Autoplay blocked forward scene', i);
        showOverlay(i,v);
        return;
      }
      finalizeForwardStart(i);
    }

    async function playReverse(i){
      const r=reverseVideos[i];
      activeDirection='reverse';
      if(!r){
        revChainSkip.add(i);
        return;
      }
      await waitForCanPlay(r,2200);
      try { r.pause(); r.currentTime=0; }catch(e){}
      activateReverse(i);
      const ok = await attemptPlay(r);
      if(!ok){
        log('Autoplay blocked reverse scene', i);
        showOverlay(i,r);
        return;
      }
      finalizeReverseStart(i);
      return new Promise(resolve=>{
        r.addEventListener('ended', ()=>resolve(), { once:true });
      });
    }

    function primeNextIfNeeded(){
      if(currentScene<0) return;
      if(!forwardPassDone[currentScene]){
        const v=forwardVideos[currentScene]; if(!v||!v.duration) return;
        if((v.currentTime / v.duration) >= CONFIG.PRIME_PROGRESS){
          const next = currentScene+1;
          if(next < n && !primed[next]){
            const nv=forwardVideos[next];
            if(nv){
              try {
                const p=nv.play();
                if(p&&p.then){
                  p.then(()=>{ try{ nv.pause(); nv.currentTime=0; }catch(e){} }).catch(()=>{});
                } else {
                  nv.pause(); nv.currentTime=0;
                }
                primed[next]=true;
              }catch(e){}
            }
          }
        }
      }
    }

    function frameLoop(){
      if(activeDirection==='forward') primeNextIfNeeded();
      requestAnimationFrame(frameLoop);
    }

    function abortCurrentForward(){
      if(currentScene<0) return;
      const v=forwardVideos[currentScene];
      if(v){
        try { v.pause(); }catch(e){}
      }
      stopLoop(currentScene);
    }

    // ---------- Forward catch-up ----------
    function scheduleForwardCatchup(){
      if(reverseChainActive) return;
      if(targetScene <= currentScene) return;
      if(!forwardPassDone[currentScene]) return;
      if(autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(()=>{
        if(reverseChainActive) return;
        if(targetScene > currentScene && forwardPassDone[currentScene]){
          playForward(currentScene+1).then(()=> scheduleForwardCatchup());
        }
      }, CONFIG.LOOP_DWELL_MS);
    }

    // ---------- Reverse chain ----------
    async function startReverseChain(toIndex){
      if(currentScene<=0){
        reverseChainActive=false;
        reverseChainTarget=null;
        return;
      }
      reverseChainActive=true;
      reverseChainTarget=toIndex;
      abortCurrentForward();
      await playReverse(currentScene);
      currentScene--;
      setSceneActive(currentScene);

      if(currentScene > reverseChainTarget){
        // Continue deeper
        startReverseChain(reverseChainTarget);
        return;
      }
      reverseChainActive=false;
      reverseChainTarget=null;
      // After reverse chain, if user already scrolled down ahead again:
      if(targetScene > currentScene){
        if(!forwardPassDone[currentScene]) {
          playForward(currentScene);
        } else {
          scheduleForwardCatchup();
        }
      }
    }

    // ---------- Target updates (called by free scroll tracker) ----------
    function updateTargetScene(newTarget){
      if(typeof newTarget!=='number') return;
      newTarget = Math.max(0, Math.min(n-1,newTarget));
      if(newTarget === targetScene) return;
      targetScene=newTarget;
      log('targetScene ->', targetScene);

      // If in reverse chain and user scrolls further up, extend chain
      if(reverseChainActive){
        if(targetScene < reverseChainTarget){
          reverseChainTarget = targetScene;
        }
        return;
      }

      if(currentScene === -1){
        playForward(targetScene);
        return;
      }

      if(targetScene > currentScene){
        // Forward direction
        if(forwardPassDone[currentScene]){
          scheduleForwardCatchup();
        } else {
          // Defer until this pass ends
        }
      } else if(targetScene < currentScene){
        // Start reverse chain
        startReverseChain(targetScene);
      }
    }

    function canAdvanceStrict(){
      if(currentScene<0) return false;
      return !!forwardPassDone[currentScene];
    }

    // ---------- Public API ----------
    window.videoPlayerControl = {
      updateTargetScene,
      canAdvanceStrict,
      currentScene: ()=>currentScene,
      isReversingChain: ()=>reverseChainActive,
      debugState(){
        return {
          currentScene,
          targetScene,
          reverseChainActive,
          reverseChainTarget,
          activeDirection,
          forwardPassDone: forwardPassDone.slice()
        };
      }
    };

    // ---------- Init ----------
    (async function init(){
      await playForward(0);
      frameLoop();
    })();

    /* =========================================================
       DEFERRED PRIME AFTER INTRO FORWARD PASS (Solution B)
       ---------------------------------------------------------
       Rationale:
       - We DO NOT prime on first pointer interaction (prevents intro rewind).
       - After intro (scene 0) forward pass completes (forwardPassDone[0] === true),
         we prime remaining videos (reverse + forward beyond index 0) ONCE.
       ========================================================= */
    (function setupDeferredPrime(){
      const INTRO_INDEX = 0;
      let primedOnce = false;
      let pollCount = 0;
      const MAX_POLLS = 150; // ~30s at 200ms

      function primeRemaining(){
        if(primedOnce) return;
        primedOnce = true;
        const toPrime = [];

        // Reverse videos first (often need the gesture blessing on some browsers)
        reverseVideos.forEach(v=>{
          if(v && v.currentTime === 0) toPrime.push(v);
        });

        // Forward videos except intro
        forwardVideos.forEach((v,i)=>{
          if(!v) return;
          if(i === INTRO_INDEX) return;
          if(v.currentTime === 0) toPrime.push(v);
        });

        toPrime.forEach(v=>{
          try {
            const p = v.play();
            if(p && p.then){
              p.then(()=>{
                try { v.pause(); v.currentTime = 0; }catch(_){}
              }).catch(()=>{});
            } else {
              v.pause(); v.currentTime = 0;
            }
          } catch(_){}
        });
        // log('[primeRemaining] primed count:', toPrime.length);
      }

      const poll = setInterval(()=>{
        pollCount++;
        if(forwardPassDone[INTRO_INDEX]){
          clearInterval(poll);
          // allow any end-of-intro transitions to settle
          setTimeout(primeRemaining, 300);
        } else if(pollCount > MAX_POLLS){
          clearInterval(poll); // give up silently
        }
      }, 200);
    })();

    /* NOTE: The old pointerdown prime() block has been REMOVED deliberately. */
  });
})();