// After i18n updates, split "ArchiThor" into styled spans for a quick A/B test.
// Safe no-op if text differs or has already been split.
(() => {
  const line1 = document.querySelector('.hero-title [data-i18n="hero.titleLine1"]');
  if (!line1) return;

  const t = line1.textContent || "";
  // Look for "ArchiThor" (case-insensitive), keep rest (e.g., " housing")
  const m = t.match(/archithor/i);
  if (!m) return;

  // Replace first occurrence only
  const replaced = t.replace(/ArchiThor/i,
    '<span class="hero-title__archi">Archi</span><span class="hero-title__thor">Thor</span>'
  );

  // Inject HTML safely
  line1.innerHTML = replaced;
})();