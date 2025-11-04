(function () {
  const btn  = document.getElementById('langSwitcherBtn');
  const menu = document.getElementById('langSwitcherMenu');
  const wrap = btn ? btn.closest('.c-lang') : null;
  if (!btn || !menu || !wrap) return;

  // Remove any arrow-like glyphs that might be appended to the label by other code.
  // This covers common triangles, carets, chevrons, caron, etc.
  const ARROW_CHARS_REGEX = /[▾▿▸▹▴▵▼▶►▻▲△▽◀◁❯❮⏷⏶⏴⏵˅˄ˇ]/g;

  function sanitizeLabel(str) {
    if (!str) return str;
    return str.replace(ARROW_CHARS_REGEX, '').replace(/\s{2,}/g, ' ').trim();
  }

  function forceCleanButtonText() {
    const current = btn.textContent || '';
    const cleaned = sanitizeLabel(current);
    if (current !== cleaned) {
      btn.textContent = cleaned;
    }
  }

  function setButtonLabelFromItem(itemBtn) {
    const abbr = (itemBtn.querySelector('.abbr')?.textContent || itemBtn.dataset.lang || '').trim().toUpperCase();
    const full = (itemBtn.querySelector('.full')?.textContent || itemBtn.dataset.langName || '').trim();
    const label = full ? `${abbr} (${full})` : abbr;
    btn.textContent = sanitizeLabel(label);
  }

  // Observe and auto-clean if any other script re-adds a glyph
  const observer = new MutationObserver((mutations) => {
    // Only clean when the button or its direct text changes
    let needsClean = false;
    for (const m of mutations) {
      if (m.type === 'characterData' || m.type === 'childList') {
        needsClean = true;
        break;
      }
    }
    if (needsClean) forceCleanButtonText();
  });
  observer.observe(btn, { characterData: true, childList: true, subtree: true });

  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';

  function closeMenu() {
    if (!isOpen()) return;
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');     // styles.css listens to .open
    menu.classList.remove('is-open');  // compatibility
    menu.setAttribute('aria-hidden', 'true');

    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('scroll', onScrollLike, { passive: true });
    window.removeEventListener('resize', onScrollLike);
    document.removeEventListener('visibilitychange', onVisibility, true);
  }

  function openMenu() {
    if (isOpen()) return;
    btn.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    menu.classList.add('is-open');     // compatibility
    menu.removeAttribute('aria-hidden');

    // Defer so the opening click doesn't immediately trigger outside-close
    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('scroll', onScrollLike, { passive: true });
      window.addEventListener('resize', onScrollLike);
      document.addEventListener('visibilitychange', onVisibility, true);
    }, 0);
  }

  // Toggle on button click
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    isOpen() ? closeMenu() : openMenu();
  });

  // Close on outside click
  function onDocClick(e) {
    if (e.target === btn || btn.contains(e.target)) return;
    if (menu.contains(e.target)) return;
    closeMenu();
  }

  // Close on ESC
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeMenu();
      btn.focus();
    }
  }

  // Close on scroll/resize/visibility change
  function onScrollLike() { closeMenu(); }
  function onVisibility() { if (document.hidden) closeMenu(); }

  // Also close if pointer leaves the language area
  wrap.addEventListener('mouseleave', closeMenu);

  // Choose a language
  menu.addEventListener('click', (e) => {
    const choice = e.target.closest('button[data-lang]');
    if (!choice) return;

    setButtonLabelFromItem(choice);

    // Mark selection (ARIA)
    menu.querySelectorAll('button[role="option"]').forEach(b => b.setAttribute('aria-selected', 'false'));
    choice.setAttribute('aria-selected', 'true');

    // Hint for other scripts
    document.documentElement.setAttribute('data-current-lang', (choice.dataset.lang || '').toLowerCase());

    closeMenu();
  });

  // 1) Clean any stray glyph that may be in the initial HTML
  forceCleanButtonText();

  // 2) Initialize label from the preselected item (will also be sanitized)
  const preselected = menu.querySelector('button[role="option"][aria-selected="true"]') ||
                      menu.querySelector('button[role="option"]');
  if (preselected) setButtonLabelFromItem(preselected);
})();