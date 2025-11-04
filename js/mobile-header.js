// Mobile header: hamburger menu + gallery picks with animation and proper closing
(function(){
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');
  const closeBtn = document.getElementById('mobileNavClose');
  const heroBtn = document.getElementById('openGalleryHero');

  if (!btn || !nav) { console.warn('[mobile-header] Missing #mobileMenuBtn or #mobileNav'); return; }

  // Ensure hidden at boot to avoid first-paint flash
  if (!nav.hasAttribute('hidden')) nav.setAttribute('hidden','');

  function setDVH(){
    const vh = (window.visualViewport?.height ?? window.innerHeight);
    document.documentElement.style.setProperty('--dvh', vh + 'px');
  }

  function openMenu(){
    nav.removeAttribute('hidden');               // make it renderable
    // Force a layout pass so the transition will run
    void nav.offsetHeight;
    requestAnimationFrame(() => {                // next frame = smooth entry animation
      nav.classList.add('is-open');
      document.body.classList.add('menu-open');
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded','true');
      nav.setAttribute('aria-hidden','false');
      setDVH();
    });
  }

  function closeMenu(){
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
    nav.setAttribute('aria-hidden','true');
    // After transition ends, hide DOM to prevent focus/tab traps
    setTimeout(()=>{ if(!nav.classList.contains('is-open')) nav.setAttribute('hidden',''); }, 280);
  }

  function toggle(e){
    e?.preventDefault();
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  btn.addEventListener('click', toggle);
  closeBtn?.addEventListener('click', (e)=>{ e.preventDefault(); closeMenu(); });

  // Tap backdrop area to close
  nav.addEventListener('click', (e)=>{ if(e.target === nav) closeMenu(); });

  // Expand/collapse Gallery submenu and update chevron
  nav.addEventListener('click', (e) => {
    const t = e.target.closest('[data-mnav-toggle]');
    if (!t) return;
    const sel = t.getAttribute('data-mnav-toggle');
    const sub = sel ? nav.querySelector(sel) : null;
    if (!sub) return;
    const wasHidden = sub.hasAttribute('hidden');
    nav.querySelectorAll('.mnav__submenu').forEach(s => s.setAttribute('hidden',''));
    nav.querySelectorAll('[data-mnav-toggle]').forEach(b => b.setAttribute('aria-expanded','false'));
    if (wasHidden) { sub.removeAttribute('hidden'); t.setAttribute('aria-expanded','true'); }
  });

  // Album selection -> reuse gallery.js opener
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.mnav__item[data-album]');
    if (!item || item.hasAttribute('disabled')) return;
    const key = item.getAttribute('data-album');
    heroBtn?.setAttribute('data-album', key);
    heroBtn?.click();
    closeMenu();
  });

  // Any anchor inside the mobile menu: close menu and then navigate/scroll
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a.mnav__link[href]');
    if (!a) return;
    // Ignore the collapsible button (it is a <button>, not an <a>)
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      closeMenu();
      // Navigate after the menu finishes closing for a smoother feel
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else location.hash = href;
      }, 300);
    } else {
      // External or normal link; still close the menu
      closeMenu();
    }
  });

  // ESC to close
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(); });

  (window.visualViewport || window).addEventListener?.('resize', setDVH);
  window.addEventListener('orientationchange', setDVH);
  setDVH();
})();