(function () {
  // Only wire explicit gallery openers (optional #openGallery if you use it).
  // The hero button is for smooth scroll only.
  const OPENERS = [
    document.getElementById('openGallery') // optional if present
  ].filter(Boolean);

  // Modal elements
  const MODAL = document.getElementById('gallery');
  if (!MODAL) return;

  const IMG = MODAL.querySelector('#galleryImage');
  const CAPTION = MODAL.querySelector('#galleryCaption');
  const THUMBS = MODAL.querySelector('#galleryThumbs');
  const BTN_CLOSES = MODAL.querySelectorAll('[data-gallery-close]');
  const BTN_PREV = MODAL.querySelector('[data-gallery-prev]');
  const BTN_NEXT = MODAL.querySelector('[data-gallery-next]');
  const BACKDROP = MODAL.querySelector('.gallery__backdrop');

  // Dropdown elements
  const NAV_ITEM = document.getElementById('galleryNavItem');
  const MENU_BTN = document.getElementById('galleryMenuBtn');
  const DROPDOWN = document.getElementById('galleryDropdown');

  // NEW: decide whether to show captions
  const SHOW_CAPTIONS = false;

  let albums = {};
  let albumsLoaded = false;
  let items = [];
  let albumKey = '';
  let index = 0;
  let lastFocus = null;
  let touchStartX = 0;
  let hoverTimer = null;
  let thumbsBound = false;

  const SWAP_OUT_MS = 160;
  let isSwapping = false;

  // ---------- Data handling ----------
  function normalizeAlbums(raw) {
    const out = {};
    for (const [k, v] of Object.entries(raw || {})) {
      if (Array.isArray(v)) out[k] = v;
      else if (v && Array.isArray(v.items)) out[k] = v.items.map(it => ({ src: it.src, caption: it.caption || '', alt: it.alt || '' }));
      else out[k] = [];
    }
    return out;
  }

  async function loadAlbums() {
    if (albumsLoaded) return;
    if (window.GALLERY_ALBUMS && Object.keys(window.GALLERY_ALBUMS).length) {
      albums = normalizeAlbums(window.GALLERY_ALBUMS);
      albumsLoaded = true;
      return;
    }
    try {
      const res = await fetch('data/galleries.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load galleries.json');
      const json = await res.json();
      albums = normalizeAlbums(json);
      albumsLoaded = true;
    } catch (e) {
      console.error('[Gallery] No albums available', e);
      albums = {};
      albumsLoaded = true;
    }
  }

  function selectAlbum(key) {
    albumKey = key;
    items = Array.isArray(albums[key]) ? albums[key] : [];
  }

  function firstAvailableAlbum(defaultKey = '') {
    if (defaultKey && Array.isArray(albums[defaultKey]) && albums[defaultKey].length) return defaultKey;
    const entry = Object.entries(albums).find(([, arr]) => Array.isArray(arr) && arr.length);
    return entry ? entry[0] : '';
  }

  // ---------- Modal rendering ----------
  function preload(idx) {
    if (idx < 0 || idx >= items.length) return;
    const img = new Image();
    img.src = items[idx].src;
  }

  function setActive(i, fade = false) {
    if (!items.length) return;
    const newIndex = (i + items.length) % items.length;
    const it = items[newIndex];

    // Update thumbs state early
    THUMBS.querySelectorAll('.gallery__thumb').forEach((el, j) => {
      const active = j === newIndex;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-current', active ? 'true' : 'false');
      if (active) {
        const r = el.getBoundingClientRect();
        const tr = THUMBS.getBoundingClientRect();
        if (r.left < tr.left || r.right > tr.right) {
          el.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
        }
      }
    });

    const applySwap = () => {
      index = newIndex;
      IMG.src = it.src;
      IMG.alt = it.alt || '';
      // NEW: control captions
      if (SHOW_CAPTIONS) {
        CAPTION.textContent = it.caption || '';
        CAPTION.removeAttribute('hidden');
      } else {
        CAPTION.textContent = '';
        CAPTION.setAttribute('hidden', '');
      }
      preload(index + 1);
      preload(index - 1);
    };

    if (fade && !isSwapping) {
      isSwapping = true;
      IMG.classList.add('is-swapping');
      CAPTION.classList.add('is-swapping');
      setTimeout(() => {
        applySwap();
        requestAnimationFrame(() => {
          IMG.classList.remove('is-swapping');
          CAPTION.classList.remove('is-swapping');
          setTimeout(() => { isSwapping = false; }, 180);
        });
      }, SWAP_OUT_MS);
    } else {
      applySwap();
    }
  }

  // Keep background animations/videos playing
  function pauseBgVideo(_pause) { return; }

  // Scrollbar compensation to prevent layout shift when modal opens/closes
  function applyScrollLockPadding(enable) {
    const sbw = window.innerWidth - document.documentElement.clientWidth; // scrollbar width
    if (enable && sbw > 0) {
      document.documentElement.style.setProperty('--sbw', sbw + 'px');
      document.body.style.paddingRight = sbw + 'px';
    } else {
      document.documentElement.style.setProperty('--sbw', '0px');
      document.body.style.paddingRight = '';
    }
  }

  function buildThumbs() {
    THUMBS.innerHTML = items.map((it, i) => `
      <button class="gallery__thumb" type="button" data-idx="${i}" aria-label="Show image ${i + 1}">
        <img src="${it.src}" alt="">
      </button>
    `).join('');

    if (!thumbsBound) {
      THUMBS.addEventListener('click', (e) => {
        const b = e.target.closest('.gallery__thumb');
        if (!b) return;
        const i = Number(b.getAttribute('data-idx') || 0);
        setActive(i, true);
      }, { passive: true });
      thumbsBound = true;
    }
  }

  function openModal(i = 0) {
    if (!items.length) {
      MENU_BTN?.classList.add('shake');
      setTimeout(() => MENU_BTN?.classList.remove('shake'), 400);
      return;
    }
    lastFocus = document.activeElement;

    document.body.classList.add('modal-open');
    applyScrollLockPadding(true);

    MODAL.classList.add('is-open');
    MODAL.setAttribute('aria-hidden', 'false');

    buildThumbs();
    setActive(i, false);

    // Keep background animation playing
    pauseBgVideo(false);

    requestAnimationFrame(() => {
      (MODAL.querySelector('.gallery__close') || MODAL).focus({ preventScroll: true });
    });

    document.addEventListener('keydown', onKey);
  }

  function closeModal() {
    document.body.classList.remove('modal-open');
    applyScrollLockPadding(false);

    MODAL.classList.remove('is-open');
    MODAL.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKey);

    pauseBgVideo(false);

    if (lastFocus) { try { lastFocus.focus({ preventScroll: true }); } catch {} }
  }

  function next() { if (!isSwapping) setActive(index + 1, true); }
  function prev() { if (!isSwapping) setActive(index - 1, true); }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Tab') {
      const focusables = MODAL.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const arr = Array.from(focusables).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (!arr.length) return;
      const first = arr[0], last = arr[arr.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus({ preventScroll: true }); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus({ preventScroll: true }); e.preventDefault(); }
    }
  }

  // ---------- Dropdown behavior (header) ----------
  function openMenu() {
    NAV_ITEM?.classList.add('is-open');
    DROPDOWN?.classList.add('open');
    MENU_BTN?.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    NAV_ITEM?.classList.remove('is-open');
    DROPDOWN?.classList.remove('open');
    MENU_BTN?.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    if (NAV_ITEM?.classList.contains('is-open')) closeMenu(); else openMenu();
  }

  if (NAV_ITEM) {
    NAV_ITEM.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(openMenu, 60);
    });
    NAV_ITEM.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(closeMenu, 120);
    });
  }

  MENU_BTN?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  document.addEventListener('click', (e) => {
    if (!NAV_ITEM) return;
    if (NAV_ITEM.contains(e.target)) return;
    closeMenu();
  });

  DROPDOWN?.addEventListener('click', async (e) => {
    const item = e.target.closest('.c-dd__item');
    if (!item || item.hasAttribute('disabled')) return;
    const key = item.getAttribute('data-album') || '';
    await loadAlbums();
    selectAlbum(key);
    closeMenu();
    openModal(0);
  });

  OPENERS.forEach(btn => btn.addEventListener('click', async (e) => {
    e.preventDefault();
    await loadAlbums();
    let key = btn.getAttribute('data-album') || 'apt5';
    if (!albums[key] || !albums[key].length) key = firstAvailableAlbum(key);
    if (!key) {
      MENU_BTN?.classList.add('shake');
      setTimeout(() => MENU_BTN?.classList.remove('shake'), 400);
      return;
    }
    selectAlbum(key);
    openModal(0);
  }));

  // Touch gestures
  IMG.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  IMG.addEventListener('touchend', e => {
    const dx = (e.changedTouches[0].clientX - touchStartX);
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
  });

  BTN_NEXT?.addEventListener('click', next);
  BTN_PREV?.addEventListener('click', prev);
  BTN_CLOSES.forEach(b => b.addEventListener('click', closeModal));
  BACKDROP?.addEventListener('click', closeModal);

  // Public API
  window.Gallery = {
    open: async function(albumId, startIndex = 0) {
      await loadAlbums();
      let key = albumId || firstAvailableAlbum('apt5');
      if (!key || !albums[key] || !albums[key].length) key = firstAvailableAlbum(key);
      if (!key) {
        MENU_BTN?.classList.add('shake');
        setTimeout(() => MENU_BTN?.classList.remove('shake'), 400);
        return false;
      }
      selectAlbum(key);
      openModal(Math.max(0, Math.min(startIndex, items.length - 1)));
      return true;
    },
    close: closeModal
  };

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadAlbums();
      if (DROPDOWN) {
        DROPDOWN.querySelectorAll('.c-dd__item').forEach(el => {
          const key = el.getAttribute('data-album') || '';
          if (!Array.isArray(albums[key]) || albums[key].length === 0) el.setAttribute('disabled', 'true');
          else el.removeAttribute('disabled');
        });
      }
    } catch (err) {
      console.error('[Gallery] init error', err);
    }
  });
})();