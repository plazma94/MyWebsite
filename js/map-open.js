(function(){
  const BTN_SELECTOR = '[data-map-open]';
  const mapsUrl = 'https://maps.app.goo.gl/zKUq17qC35avHrJk7'; 
  // Alternate simpler query form (either works):
  // const mapsUrl = 'https://www.google.com/maps?q=47.1780926,8.4443069&z=16';

  function openMap(){
    window.open(mapsUrl, '_blank', 'noopener');
  }

  document.addEventListener('click', e=>{
    const btn = e.target.closest(BTN_SELECTOR);
    if(!btn) return;
    openMap();
  });

  // Keyboard activation (space key already triggers click on buttons in most browsers,
  // but we ensure Enter also works consistently if future markup changes)
  document.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      const active = document.activeElement;
      if(active && active.matches(BTN_SELECTOR)){
        e.preventDefault();
        openMap();
      }
    }
  });
})();