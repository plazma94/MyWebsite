(function(){
  const FALLBACK = 'eng';
  const LABELS = {
    eng: 'ENG (English)',
    ger: 'GER (Deutsch)',
    srb: 'SRB (Srpski)'
  };

  // Allow URL override (?lang=ger) for shareable deep links
  function getQueryLang(){
    try {
      const p = new URLSearchParams(window.location.search);
      const q = p.get('lang');
      return (q && LABELS[q]) ? q : null;
    } catch(e){ return null; }
  }

  const stored = localStorage.getItem('siteLang');
  const queryOverride = getQueryLang();
  const lang = queryOverride || stored || FALLBACK;

  // Reflect chosen language in <html> early
  document.documentElement.setAttribute('data-current-lang', lang);
  document.documentElement.setAttribute('lang', lang === 'eng' ? 'en' : (lang === 'ger' ? 'de' : 'sr'));

  function applyLanguage(l){
    if(!window.I18N) return; // i18n.js not yet loaded
    I18N.setLang(l);
    updateUI(l);
  }

  function updateUI(l){
    const btn = document.getElementById('langSwitcherBtn');
    if(btn){
      btn.textContent = (LABELS[l] || l.toUpperCase()) + ' ▾';
      btn.setAttribute('aria-expanded', 'false');
    }
    // Mark selected option
    document.querySelectorAll('#langSwitcherMenu [data-lang]').forEach(el=>{
      const active = el.getAttribute('data-lang') === l;
      el.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  // Wait until DOM + i18n are ready (both deferred)
  window.addEventListener('DOMContentLoaded', function(){
    applyLanguage(lang);
  });

  // Language menu interaction
  document.addEventListener('click', function(e){
    const opt = e.target.closest('#langSwitcherMenu [data-lang]');
    if(!opt) return;
    const newLang = opt.getAttribute('data-lang');
    if(!LABELS[newLang]) return;
    localStorage.setItem('siteLang', newLang);
    document.documentElement.setAttribute('data-current-lang', newLang);
    document.documentElement.setAttribute('lang', newLang === 'eng' ? 'en' : (newLang === 'ger' ? 'de' : 'sr'));
    applyLanguage(newLang);
  });

})();