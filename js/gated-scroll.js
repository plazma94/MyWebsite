// free-scroll-tracker.js
// Computes target scene from scroll position WITHOUT clamping.
// Calls videoPlayerControl.updateTargetScene(targetIdx) as user scrolls.
// Hysteresis to avoid flicker: only change target when viewport center crosses 35% into a new section.

(function(){
  const SECTION_SELECTOR = '.scene-text';
  const THRESHOLD_RATIO = 0.35; // must align with CONFIG.TARGET_THRESHOLD_RATIO hint in player (not enforced)
  const HYSTERESIS_PX = 24;     // small buffer to reduce jitter

  let sections = [];
  let lastTarget = 0;
  let ticking = false;

  function measure(){
    sections = Array.from(document.querySelectorAll(SECTION_SELECTOR)).map((el,i)=>{
      return {
        el,
        index: i,
        top: el.offsetTop,
        height: el.offsetHeight
      };
    });
  }

  function computeTarget(){
    const scrollY = window.scrollY || 0;
    const vh = window.innerHeight || 1;
    const focusY = scrollY + vh * THRESHOLD_RATIO;

    let candidate = 0;
    for(let i=0;i<sections.length;i++){
      const s=sections[i];
      if(focusY >= s.top - HYSTERESIS_PX) candidate = i;
      else break;
    }
    return candidate;
  }

  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      ticking=false;
      const target = computeTarget();
      if(target !== lastTarget){
        lastTarget = target;
        if(window.videoPlayerControl && typeof window.videoPlayerControl.updateTargetScene === 'function'){
          window.videoPlayerControl.updateTargetScene(target);
        }
        // Mark active text block visually
        sections.forEach(s=> s.el.classList.toggle('is-active', s.index === target));
      }
    });
  }

  function onResize(){
    measure();
    // Re-evaluate target after layout shift
    onScroll();
  }

  function init(){
    measure();
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', ()=>{
      clearTimeout(init._rt);
      init._rt = setTimeout(onResize, 120);
    }, { passive:true });
    // Initial
    onScroll();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();