(function(){
  function smoothScrollTo(el){
    if(!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top, behavior:'smooth' });
  }
  document.addEventListener('click', e=>{
    const back = e.target.closest('[data-hd-back]');
    if(back){
      const hero = document.querySelector('.scene-text[data-scene-index="0"]');
      smoothScrollTo(hero);
    }
    const book = e.target.closest('.hd-book-btn');
    if(book){
      const contact = document.getElementById('contact');
      smoothScrollTo(contact);
    }
  });
})();