(function(){
  const KEY = 'consent.v1';
  const DEFAULTS = { essential: true, analytics: false, marketing: false, timestamp: 0, gpc: false };

  // Respect Global Privacy Control (automatic reject non‑essential)
  const gpc = !!(navigator.globalPrivacyControl);

  // Load/save
  function load(){
    try{ const v = JSON.parse(localStorage.getItem(KEY)||''); if(v && typeof v==='object') return v; }catch(_){}
    return { ...DEFAULTS, gpc };
  }
  function save(c){ try{ localStorage.setItem(KEY, JSON.stringify(c)); }catch(_){} }

  // Execute blocked scripts for allowed categories
  function executeFor(consent){
    document.querySelectorAll('script[type="text/plain"][data-consent]:not([data-executed])')
      .forEach(src=>{
        const cat = (src.getAttribute('data-consent')||'').trim();
        if(!cat || !consent[cat]) return;
        const s = document.createElement('script');
        // external?
        const external = src.getAttribute('data-src') || src.getAttribute('src');
        if(external){ s.src = external; s.async = true; }
        s.text = src.text || '';
        // Copy important attrs
        ['nonce','crossorigin','referrerpolicy'].forEach(a=>{
          const v = src.getAttribute(a); if(v) s.setAttribute(a,v);
        });
        src.parentNode.insertBefore(s, src.nextSibling);
        src.setAttribute('data-executed','true');
      });
  }

  // UI helpers
  function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
  function show(node){ node.style.display='block'; }
  function hide(node){ node.style.display='none'; }

  // Banner markup (injected)
  const banner = el(`
    <div class="c-consent" id="consentBanner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <h3 class="c-consent__title">Your privacy</h3>
      <p class="c-consent__text">We use essential cookies to make this site work. We’d also like to use optional cookies (analytics/marketing) to improve our services. You can change your choice anytime.</p>
      <div class="c-consent__actions">
        <button type="button" class="c-btn" data-accept>Accept all</button>
        <button type="button" class="c-btn c-btn--ghost" data-reject>Reject non‑essential</button>
        <button type="button" class="c-btn c-btn--ghost" data-settings>Cookie settings</button>
      </div>
      <div class="c-consent__links">
        <a href="#cookie-policy" data-policy>Cookie policy</a>
        <a href="#privacy-policy" data-privacy>Privacy policy</a>
      </div>
    </div>
  `);

  // Preferences panel (injected)
  const prefs = el(`
    <div class="c-pref" id="consentPrefs" aria-hidden="true">
      <div class="c-pref__backdrop" data-close></div>
      <div class="c-pref__panel" role="dialog" aria-modal="true" aria-label="Cookie preferences">
        <h3 class="c-pref__title">Cookie preferences</h3>
        <div class="c-pref__row">
          <div><strong>Essential</strong><br><span style="opacity:.8;font-size:12px">Required for the site to work</span></div>
          <input type="checkbox" class="c-switch" checked disabled>
        </div>
        <div class="c-pref__row">
          <div><strong>Analytics</strong><br><span style="opacity:.8;font-size:12px">Helps us understand usage</span></div>
          <input type="checkbox" class="c-switch" id="sw-analytics">
        </div>
        <div class="c-pref__row">
          <div><strong>Marketing</strong><br><span style="opacity:.8;font-size:12px">Personalization & ads</span></div>
          <input type="checkbox" class="c-switch" id="sw-marketing">
        </div>
        <div class="c-pref__actions">
          <button type="button" class="c-btn c-btn--ghost" data-close>Cancel</button>
          <button type="button" class="c-btn" data-save>Save</button>
        </div>
      </div>
    </div>
  `);

  function openPrefs(current){
    const a = prefs.querySelector('#sw-analytics');
    const m = prefs.querySelector('#sw-marketing');
    a.checked = !!current.analytics;
    m.checked = !!current.marketing;
    show(prefs);
  }
  function closePrefs(){ hide(prefs); }

  // Mount
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.appendChild(banner);
    document.body.appendChild(prefs);

    const state = load();

    // GPC auto‑reject non‑essential on first visit
    if(state.timestamp === 0 && state.gpc){
      state.analytics = false;
      state.marketing = false;
      state.timestamp = Date.now();
      save(state);
    }

    // If not decided, show banner
    if(!state.timestamp){
      show(banner);
    } else {
      executeFor(state);
    }

    // Wire actions
    banner.querySelector('[data-accept]').addEventListener('click', ()=>{
      const c = { essential:true, analytics:true, marketing:true, timestamp: Date.now(), gpc };
      save(c); hide(banner); executeFor(c);
    });
    banner.querySelector('[data-reject]').addEventListener('click', ()=>{
      const c = { essential:true, analytics:false, marketing:false, timestamp: Date.now(), gpc };
      save(c); hide(banner); /* nothing to execute */
    });
    banner.querySelector('[data-settings]').addEventListener('click', ()=> openPrefs(load()));

    prefs.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', closePrefs));
    prefs.querySelector('[data-save]').addEventListener('click', ()=>{
      const a = prefs.querySelector('#sw-analytics').checked;
      const m = prefs.querySelector('#sw-marketing').checked;
      const c = { essential:true, analytics:a, marketing:m, timestamp: Date.now(), gpc };
      save(c); closePrefs(); hide(banner); executeFor(c);
    });

    // Public “manage cookies” hook (optional)
    const manage = document.getElementById('manageCookies');
    if(manage){
      manage.addEventListener('click', (e)=>{ e.preventDefault(); openPrefs(load()); });
    }

    // Expose API if needed
    window.Consent = {
      get: load,
      set(c){ save(c); executeFor(load()); },
      openPreferences(){ openPrefs(load()); }
    };
  });
})();