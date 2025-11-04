// tech-reveal.js
// Reveals technology grid items with stagger when the grid enters viewport once.

(() => {
  const grid = document.querySelector('[data-tech-grid]');
  if(!grid) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        grid.classList.add('tech-grid--revealed');
        observer.disconnect();
      }
    });
  }, { root:null, threshold:0.18 });

  observer.observe(grid);
})();