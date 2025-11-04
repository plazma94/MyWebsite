/* brand-marquee.js
   - Clones the image items once so the strip is doubled in width.
   - Runs animation only while the brand section is on screen.
*/
(function(){
  const section = document.getElementById('developer');
  const track   = section ? section.querySelector('.brand-ref__gallery') : null;
  if (!section || !track) return;

  // If we already cloned (hot reloads), skip
  if (!track.__clonedOnce){
    const originals = Array.from(track.children);
    originals.forEach(li => track.appendChild(li.cloneNode(true)));
    track.__clonedOnce = true;
  }

  // Start/stop animation when visible (perf-friendly)
  const start = () => track.style.animationPlayState = 'running';
  const stop  = () => track.style.animationPlayState = 'paused';

  // Initial state: paused until visible
  stop();

  const io = new IntersectionObserver(entries=>{
    const e = entries[0];
    if (!e) return;
    if (e.isIntersecting) start(); else stop();
  }, { threshold: 0.1 });

  io.observe(section);

  // If fonts/images layout shift after load, ensure animation resumes
  window.addEventListener('load', () => {
    // small timeout to let layout settle
    setTimeout(()=>{ if (document.visibilityState === 'visible') start(); }, 50);
  });

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', ()=>{
    if (document.visibilityState === 'hidden') stop();
    else start();
  });
})();