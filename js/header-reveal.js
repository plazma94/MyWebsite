// header-reveal.js (with i18n hook)
(() => {
  const INTRO_SCENE_INDEX = 0;
  const POLL_MS = 160;
  const FALLBACK_MS = 10000;
  const SCROLL_DURATION_MS = 1400;
  const header = document.getElementById('cinematicHeader');
  if(!header) return;

  function easeInOutQuad(t){ return t<0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function animatedScrollTo(targetY, duration=800){
    const startY = window.scrollY || window.pageYOffset;
    const dist = targetY - startY;
    if(Math.abs(dist) < 2){ window.scrollTo(0, targetY); return; }
    let startTime = null;
    function step(ts){
      if(!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const p = Math.min(1, elapsed / duration);
      const eased = easeInOutQuad(p);
      window.scrollTo(0, startY + dist * eased);
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function scrollToScene(sceneIndex){
    const el = document.querySelector(`.scene-text[data-scene-index="${sceneIndex}"]`);
    if(!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    animatedScrollTo(top, SCROLL_DURATION_MS);
  }
  function scrollToAnchor(id){
    const el = document.getElementById(id);
    if(!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    animatedScrollTo(top, SCROLL_DURATION_MS);
  }

  let revealed = false;
  let pollTimer = null;
  let fallbackTimer = null;
  function introDone(){
    try{
      if(!window.videoPlayerControl || typeof window.videoPlayerControl.debugState !== 'function') return false;
      const st = window.videoPlayerControl.debugState();
      return !!(st && st.forwardPassDone && st.forwardPassDone[INTRO_SCENE_INDEX]);
    }catch(e){ return false; }
  }
  function reveal(){
    if(revealed) return;
    revealed = true;
    header.classList.add('is-visible');
    document.documentElement.classList.add('header-visible');
    if(pollTimer) clearInterval(pollTimer);
    if(fallbackTimer) clearTimeout(fallbackTimer);
  }
  function startPolling(){
    pollTimer = setInterval(()=>{ if(introDone()) reveal(); }, POLL_MS);
    fallbackTimer = setTimeout(()=>reveal(), FALLBACK_MS);
  }

  header.addEventListener('click', e=>{
    const sceneLink = e.target.closest('a[data-scene]');
    if(sceneLink){
      e.preventDefault();
      const idx = Number(sceneLink.getAttribute('data-scene'));
      if(Number.isFinite(idx)) scrollToScene(idx);
      return;
    }
    const anchor = e.target.closest('a[href^="#"]:not([data-scene])');
    if(anchor){
      const id = anchor.getAttribute('href').slice(1);
      if(id){
        e.preventDefault();
        scrollToAnchor(id);
      }
    }
  });

  // Language switcher
  const LANGS = [
    { code:'eng', label:'ENG (English)' },
    { code:'ger', label:'GER (German)' },
    { code:'srb', label:'SRB (Serbian)' }
  ];
  const STORAGE_KEY = 'siteLang';

  const langBtn = document.getElementById('langSwitcherBtn') || header.querySelector('.c-lang__btn');
  const langMenu = document.getElementById('langSwitcherMenu') || header.querySelector('.c-lang__menu');

  function setActiveLang(code){
    const lang = LANGS.find(l => l.code === code) || LANGS[0];
    if(langBtn){
      langBtn.textContent = `${lang.label} ▾`;
    }
    if(langMenu){
      langMenu.querySelectorAll('[data-lang]').forEach(btn=>{
        const isActive = btn.getAttribute('data-lang') === lang.code;
        btn.setAttribute('aria-selected', isActive ? 'true':'false');
      });
    }
    try { localStorage.setItem(STORAGE_KEY, lang.code); } catch(e){}
    // i18n hook:
    if(window.I18N && typeof window.I18N.setLang === 'function'){
      window.I18N.setLang(lang.code);
    }
  }

  if(langBtn && langMenu){
    langBtn.addEventListener('click', ()=>{
      const open = langMenu.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', open ? 'true':'false');
    });
    langMenu.querySelectorAll('[data-lang]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const code = btn.getAttribute('data-lang');
        setActiveLang(code);
        langMenu.classList.remove('open');
        langBtn.setAttribute('aria-expanded','false');
      });
    });
    document.addEventListener('click', ev=>{
      if(!langMenu.contains(ev.target) && ev.target !== langBtn){
        langMenu.classList.remove('open');
        langBtn.setAttribute('aria-expanded','false');
      }
    });
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch(e){}
    setActiveLang(stored || 'eng');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startPolling, { once:true });
  } else {
    startPolling();
  }
})();