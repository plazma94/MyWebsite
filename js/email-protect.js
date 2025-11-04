(function () {
  const STICKY_REVEAL = true; // once revealed, keep visible until page reload

  function b64d(s) { try { return atob(s); } catch (_) { return ''; } }

  function maskEmail(user, domain) {
    if (!user || !domain) return 'Email';
    const u = user.length > 2 ? user[0] + '…' + user.slice(-1) : user;
    const parts = domain.split('.');
    const h = parts[0];
    const hMasked = h.length > 2 ? h[0] + '…' + h.slice(-1) : h;
    return `${u}@${hMasked}.${parts.slice(1).join('.')}`;
  }

  function setText(el, text) { el.textContent = text; }

  function getAddr(el) {
    const u = b64d(el.dataset.u || '');
    const d = b64d(el.dataset.d || '');
    return (u && d) ? `${u}@${d}` : '';
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch(_) {}
    try {
      const sel = window.getSelection();
      const range = document.createRange();
      const tmp = document.createElement('span');
      tmp.textContent = text;
      tmp.style.all = 'unset';
      tmp.style.position = 'fixed';
      tmp.style.left = '-9999px';
      document.body.appendChild(tmp);
      range.selectNodeContents(tmp);
      sel.removeAllRanges();
      sel.addRange(range);
      const ok = document.execCommand('copy');
      sel.removeAllRanges();
      tmp.remove();
      return ok;
    } catch(_) { return false; }
  }

  function reveal(el) {
    if (el.dataset.revealed === '1') return;
    const addr = getAddr(el);
    if (!addr) return;

    setText(el, addr);

    // Optional mailto if requested via data-mailto="1" and tag is <a>
    const wantMailto = el.dataset.mailto === '1';
    if (wantMailto && el.tagName === 'A') {
      el.setAttribute('href', `mailto:${addr}`);
      el.setAttribute('rel', 'nofollow noopener');
    } else {
      if (el.hasAttribute('href')) el.removeAttribute('href');
    }
    el.dataset.revealed = '1';
  }

  function conceal(el) {
    if (STICKY_REVEAL && el.dataset.revealed === '1') return; // keep visible
    const u = b64d(el.dataset.u || '');
    const d = b64d(el.dataset.d || '');
    const label = el.dataset.label || maskEmail(u, d);
    setText(el, label);
    el.dataset.revealed = '0';
    if (el.tagName === 'A' && el.hasAttribute('href') && el.dataset.mailto !== '1') {
      el.removeAttribute('href');
    }
  }

  function initOne(el) {
    // Start masked (or with provided label)
    conceal(el);

    // Hover/focus reveal
    el.addEventListener('pointerenter', () => reveal(el));
    el.addEventListener('focus', () => reveal(el));

    // If not sticky, hide back on leave/blur
    el.addEventListener('pointerleave', () => { if (!STICKY_REVEAL) conceal(el); });
    el.addEventListener('blur', () => { if (!STICKY_REVEAL) conceal(el); });

    // Click behavior:
    // - If not mailto: prevent navigation, toggle reveal, and if already revealed copy to clipboard
    // - If mailto enabled and already revealed: allow default
    el.addEventListener('click', async (e) => {
      const wantMailto = el.dataset.mailto === '1';
      const isRevealed = el.dataset.revealed === '1';

      if (!wantMailto) {
        e.preventDefault();
        if (!isRevealed) {
          reveal(el);
        } else {
          const addr = getAddr(el);
          if (addr) { await copyToClipboard(addr); }
        }
      } else {
        // mailto mode: ensure it’s revealed first click; second click opens client
        if (!isRevealed) {
          e.preventDefault();
          reveal(el);
        }
      }
    });
  }

  function init() {
    document.querySelectorAll('[data-email][data-u][data-d]').forEach(initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();