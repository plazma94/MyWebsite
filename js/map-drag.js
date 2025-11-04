// map-drag.js – lightweight panning for the placeholder map image.
// Does not interfere with videos or scroll.

(() => {
  const map = document.querySelector('[data-loc-map]');
  if(!map) return;
  const img = map.querySelector('img');
  if(!img) return;

  let isDown = false;
  let startX = 0;
  let startY = 0;
  let curX = 0;
  let curY = 0;
  let moved = false;

  function setTransform(){
    img.style.transform = `translate(calc(-50% + ${curX}px), calc(-50% + ${curY}px))`;
  }

  function onDown(e){
    isDown = true;
    moved = false;
    map.classList.add('loc-map--active');
    startX = (e.touches ? e.touches[0].clientX : e.clientX) - curX;
    startY = (e.touches ? e.touches[0].clientY : e.clientY) - curY;
  }

  function onMove(e){
    if(!isDown) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    curX = x - startX;
    curY = y - startY;
    if(Math.abs(curX) > 3 || Math.abs(curY) > 3) moved = true;
    setTransform();
    if(moved) map.classList.add('loc-map--moved');
  }

  function onUp(){
    isDown = false;
    map.classList.remove('loc-map--active');
  }

  map.addEventListener('mousedown', onDown);
  map.addEventListener('touchstart', onDown, { passive:true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive:true });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  // Prevent default image drag ghost
  img.addEventListener('dragstart', e=> e.preventDefault());
})();