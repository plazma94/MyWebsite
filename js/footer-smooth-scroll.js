// Smooth-scroll only for footer nav anchors (won't affect header/mobile behavior)
(function () {
  function onClick(e) {
    const href = this.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    // Respect sections' scroll-margin-top already defined in CSS (#map, #technology)
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update the hash so back/forward works as expected
      history.pushState(null, '', '#' + id);
    } catch (_) {
      // Fallback for very old browsers
      const y = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      window.scrollTo({ top: y, behavior: 'smooth' });
      try { history.pushState(null, '', '#' + id); } catch (__){}
    }

    // Optional: tidy focus for accessibility
    try { this.blur(); } catch(_) {}
  }

  function init() {
    const footerLinks = document.querySelectorAll('.sf-nav a[href^="#"]');
    footerLinks.forEach(a => a.addEventListener('click', onClick, { passive: false }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();