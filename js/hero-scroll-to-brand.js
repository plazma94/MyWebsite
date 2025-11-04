(function () {
  const BTN_ID = 'openGalleryHero';
  const TARGET_ID = 'developer';
  const DURATION_MS = 1600; // adjust for slower/faster scroll

  function parsePx(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, duration) {
    const startY = window.scrollY || window.pageYOffset || 0;
    const dist = targetY - startY;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeInOutCubic(t);
      window.scrollTo(0, startY + dist * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    const btn = document.getElementById(BTN_ID);
    const target = document.getElementById(TARGET_ID);
    if (!btn || !target) return;

    // Ensure hero is not treated as a gallery trigger anywhere
    if (btn.hasAttribute('data-album')) btn.removeAttribute('data-album');

    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const smt = parsePx(getComputedStyle(target).scrollMarginTop || '0');
      const rawTargetY = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) - smt;

      // Clamp so we never scroll beyond bottom
      const doc = document.documentElement;
      const maxY = Math.max(0, (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight - 1);
      const clampedY = Math.min(rawTargetY, maxY);

      smoothScrollTo(clampedY, DURATION_MS);
      try { this.blur(); } catch(_) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();