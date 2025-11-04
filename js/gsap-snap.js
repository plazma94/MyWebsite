// gsap-snap.js with STRICT first-pass gating.
// Wheel / swipe navigation only fires when videoPlayerControl.canAdvanceStrict() === true.
// Otherwise: 
//   - If inside .overlay-scroll and it can scroll in that direction -> allow inner scroll.
//   - Else block (preventDefault) so the scene stays and video keeps playing.
//
// Tuning matches your preference:
//   WHEEL_THRESHOLD: 40
//   ANIM_DUR: 1 second
//   WHEEL_COOLDOWN_MS: 250

(function(){
  const CFG = {
    SELECTOR: '.scene',
    ANIM_DUR: 1.0,
    ANIM_EASE: 'power2.out',
    WHEEL_THRESHOLD: 40,
    WHEEL_COOLDOWN_MS: 250,
    TOUCH_SWIPE_PX: 28,
    TOUCH_COOLDOWN_MS: 350
  };

  function hasScrollTo(){
    return typeof gsap!=='undefined' && gsap.plugins && gsap.plugins.scrollTo;
  }
  function collect(){
    const els = Array.from(document.querySelectorAll(CFG.SELECTOR));
    const tops = els.map(el=>el.offsetTop);
    return { els, tops };
  }
  function clamp(v,min,max){ return Math.min(max, Math.max(min,v)); }
  function nearest(tops,y){
    let best=0, bestD=Math.abs(tops[0]-y);
    for(let i=1;i<tops.length;i++){
      const d=Math.abs(tops[i]-y);
      if(d<bestD){ best=i; bestD=d; }
    }
    return best;
  }
  function dispatch(name,detail){
    try { document.dispatchEvent(new CustomEvent(name,{detail})); } catch(e){}
  }
  function canAdvanceStrict(){
    return !!(window.videoPlayerControl &&
              typeof window.videoPlayerControl.canAdvanceStrict === 'function' &&
              window.videoPlayerControl.canAdvanceStrict());
  }
  function overlayCanScroll(os, deltaY){
    if(!os) return false;
    if(deltaY>0){
      return os.scrollTop + os.clientHeight < os.scrollHeight - 1;
    } else if(deltaY<0){
      return os.scrollTop > 0;
    }
    return false;
  }

  function init(){
    const data = collect();
    if(!data.els.length) return;
    let currentIndex = nearest(data.tops, window.scrollY||0);
    let isAnimating=false;
    let wheelLocked=false;
    let touchLocked=false;

    function animateTo(idx){
      idx = clamp(idx, 0, data.els.length-1);
      if(idx===currentIndex || isAnimating) return;
      const targetTop = data.tops[idx];
      dispatch('snap:starting', { index: idx, element: data.els[idx] });
      isAnimating=true;
      const done=()=>{
        isAnimating=false;
        currentIndex=idx;
        dispatch('snap:changed', { index: idx, element: data.els[idx] });
        dispatch('snap:complete', { index: idx, element: data.els[idx] });
      };
      if(CFG.ANIM_DUR===0 || !hasScrollTo()){
        window.scrollTo(0,targetTop);
        setTimeout(done,0);
        return;
      }
      gsap.to(window,{
        duration: CFG.ANIM_DUR,
        ease: CFG.ANIM_EASE,
        scrollTo: targetTop,
        onComplete: done,
        onInterrupt: ()=>{ isAnimating=false; }
      });
    }

    function handleWheel(e){
      let dy=e.deltaY;
      if(e.deltaMode===1) dy*=16;
      else if(e.deltaMode===2) dy*=innerHeight;

      // Gating: before first pass ends
      if(!canAdvanceStrict()){
        document.body.classList.add('scene-advance-blocked');
        const os = e.target && e.target.closest && e.target.closest('.overlay-scroll');
        if(os && overlayCanScroll(os, dy)){
          // allow inner scroll
          return;
        }
        // block scene navigation & page scroll
        e.preventDefault?.();
        e.stopPropagation?.();
        return;
      } else {
        document.body.classList.remove('scene-advance-blocked');
      }

      if(isAnimating || wheelLocked) return;
      if(Math.abs(dy) < CFG.WHEEL_THRESHOLD) return;

      e.preventDefault?.();
      e.stopPropagation?.();

      wheelLocked=true;
      setTimeout(()=>{ wheelLocked=false; }, CFG.WHEEL_COOLDOWN_MS);

      const dir = dy>0 ? 1 : -1;
      const target = clamp(currentIndex + dir, 0, data.els.length - 1);
      if(target===currentIndex) return;
      animateTo(target);
    }

    function handleTouchStart(ev){
      const t=ev.touches && ev.touches[0];
      touchState.startY = t ? t.clientY : null;
      touchState.lastY = touchState.startY;
    }
    function handleTouchMove(ev){
      if(touchState.startY == null) return;
      const t=ev.touches && ev.touches[0]; if(!t) return;
      const dy = t.clientY - touchState.lastY;
      touchState.lastY = t.clientY;

      if(!canAdvanceStrict()){
        document.body.classList.add('scene-advance-blocked');
        const os = ev.target && ev.target.closest && ev.target.closest('.overlay-scroll');
        if(os){
          // inside overlay-scroll
          if( (dy<0 && overlayCanScroll(os, -1)) || (dy>0 && overlayCanScroll(os, 1)) ){
            // allow natural internal scrolling
            return;
          }
        }
        // Prevent scene change
        ev.preventDefault();
        return;
      } else {
        document.body.classList.remove('scene-advance-blocked');
      }

      if(isAnimating || touchLocked) return;
      if(Math.abs(touchState.startY - t.clientY) >= CFG.TOUCH_SWIPE_PX){
        touchLocked=true;
        setTimeout(()=>{ touchLocked=false; }, CFG.TOUCH_COOLDOWN_MS);
        const dir = (touchState.startY - t.clientY) > 0 ? 1 : -1; // swipe up => next
        const target = clamp(currentIndex + dir, 0, data.els.length - 1);
        if(target!==currentIndex){
          ev.preventDefault();
          animateTo(target);
        }
        touchState.startY = null;
      }
    }
    function handleTouchEnd(){ touchState.startY=null; }

    const touchState = { startY:null, lastY:null };

    try { window.addEventListener('wheel', handleWheel, { passive:false }); }
    catch(e){ window.addEventListener('wheel', handleWheel, { passive:true }); }
    window.addEventListener('touchstart', handleTouchStart, { passive:true });
    window.addEventListener('touchmove', handleTouchMove, { passive:false });
    window.addEventListener('touchend', handleTouchEnd, { passive:true });

    // Resize recompute
    let rTimer=null;
    window.addEventListener('resize', ()=>{
      if(rTimer) clearTimeout(rTimer);
      rTimer=setTimeout(()=>{
        const fresh=collect();
        data.els.length=0; data.tops.length=0;
        fresh.els.forEach(e=>data.els.push(e));
        fresh.tops.forEach(t=>data.tops.push(t));
        currentIndex = clamp(nearest(data.tops, window.scrollY||0), 0, data.els.length-1);
      },140);
    }, { passive:true });

    // API
    window.scrollSnap = window.scrollSnap || {};
    window.scrollSnap.goTo = i => animateTo(i);
    window.scrollSnap.next = () => animateTo(currentIndex+1);
    window.scrollSnap.prev = () => animateTo(currentIndex-1);

    // Initial dispatch
    setTimeout(()=>{
      currentIndex = nearest(data.tops, window.scrollY||0);
      dispatch('snap:changed', { index: currentIndex, element: data.els[currentIndex] });
      dispatch('snap:complete', { index: currentIndex, element: data.els[currentIndex] });
    },60);
  }

  window.addEventListener('load', ()=>{ try { init(); }catch(e){ console.warn('snap init failed', e);} }, { once:true });
})();