// location-reveal.js
// Reveals the Location left panel (title, divider, list rows) with a stagger.
// The map on the right is not animated.

(() => {
  const panel = document.querySelector('.loc-panel');
  if (!panel) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        panel.classList.add('loc-panel--revealed');
        observer.disconnect();
      }
    });
  }, { root: null, threshold: 0.18 });

  observer.observe(panel);
})();