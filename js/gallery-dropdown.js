// gallery-dropdown.js
// Bridge clicks from header/mobile items to your existing Gallery opener,
// without recursing when we fall back to the hero CTA.

(() => {
  if (window.__galleryDelegationInstalled) return;
  window.__galleryDelegationInstalled = true;

  let isBridging = false; // reentrancy guard

  const closeDropdowns = () => {
    // Header dropdown
    const btn = document.getElementById('galleryMenuBtn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    const dd = document.getElementById('galleryDropdown');
    if (dd && dd.classList.contains('open')) dd.classList.remove('open');

    // Mobile menu: collapse Gallery group if it was open
    const mToggle = document.querySelector('[data-mnav-toggle="#mnavGallery"]');
    const mPanel = document.getElementById('mnavGallery');
    if (mToggle && mPanel && !mPanel.hasAttribute('hidden')) {
      mPanel.setAttribute('hidden', '');
      mToggle.setAttribute('aria-expanded', 'false');
    }
  };

  const openAlbumLoose = (albumId) => {
    // 1) Preferred API
    if (window.Gallery && typeof window.Gallery.open === 'function') {
      window.Gallery.open(albumId);
      return true;
    }
    // 2) Legacy global
    if (typeof window.openGallery === 'function') {
      window.openGallery(albumId);
      return true;
    }
    // 3) Fallback: reuse hero CTA (avoid recursion)
    const heroBtn = document.getElementById('openGalleryHero');
    if (heroBtn) {
      try {
        isBridging = true;
        heroBtn.setAttribute('data-album', albumId);
        heroBtn.click(); // trigger whatever handler the hero uses
        return true;
      } finally {
        // release guard after current tick so our own click listener can't re-enter
        setTimeout(() => { isBridging = false; }, 0);
      }
    }
    console.warn('[gallery-dropdown] No gallery opener found. Expose window.Gallery.open(albumId) or openGallery(albumId).');
    return false;
  };

  // Global delegation (bubble phase). Ignore hero CTA to prevent loops.
  document.addEventListener('click', (e) => {
    if (isBridging) return;

    const trigger = e.target.closest('[data-album]:not([disabled])');
    if (!trigger) return;

    // If the hero CTA was clicked normally, let its own handler run.
    if (trigger.id === 'openGalleryHero') return;

    const albumId = trigger.getAttribute('data-album');
    if (!albumId) return;

    e.preventDefault();
    e.stopPropagation();

    const ok = openAlbumLoose(albumId);
    if (ok) closeDropdowns();
  }); // NOTE: no capture=true
})();