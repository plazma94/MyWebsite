// Mobile viewport sanity + lighter video preloading + header height var
(function(){
  const mqSmall = window.matchMedia('(max-width: 800px)');

  function setDVH(){
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--dvh', vh + 'px');
  }

  function setHeaderH(){
    const header = document.getElementById('cinematicHeader');
    const h = header ? Math.round(header.getBoundingClientRect().height) : 56;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }

  // Debounce to avoid layout thrash
  let raf = null;
  function scheduleMeasure(){
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      setDVH();
      setHeaderH();
    });
  }

  // Initial
  scheduleMeasure();

  // Update on viewport and orientation changes
  (window.visualViewport || window).addEventListener('resize', scheduleMeasure);
  window.addEventListener('orientationchange', scheduleMeasure);
  window.addEventListener('load', scheduleMeasure);
  document.addEventListener('DOMContentLoaded', scheduleMeasure);

  // Mobile-only video preload tuning
  function tuneVideoPreload(){
    if (!mqSmall.matches) return;
    try {
      // Reverse clips are rarely needed on phones; avoid preloading
      document.querySelectorAll('.scene-video.reverse').forEach(v => { v.preload = 'none'; });
      // Forward clips after intro: metadata only
      document.querySelectorAll('.scene[data-scene]:not([data-scene="0"]) .scene-video.forward')
        .forEach(v => { v.preload = 'metadata'; });
    } catch {}
  }
  tuneVideoPreload();
  mqSmall.addEventListener?.('change', tuneVideoPreload);
})();