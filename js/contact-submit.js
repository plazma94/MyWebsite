/* Contact form submitter (Web3Forms) + minor UX helpers
   - Sends: name, email, message, attachment
   - Shows: inline success/error message
   - Keeps your current HTML structure and IDs/classes
*/
(function () {
  const FORM = document.querySelector('.contact-form');
  if (!FORM) return;

  // REQUIRED: paste your Web3Forms Access Key here (from https://web3forms.com/)
  const WEB3FORMS_ACCESS_KEY = '031cc477-5382-4303-b65f-0d6be5db8479';

  // Elements
  const nameEl = FORM.querySelector('input[name="name"]');
  const emailEl = FORM.querySelector('input[name="email"]');
  const msgEl = FORM.querySelector('textarea[name="message"]');
  const fileInput = FORM.querySelector('#cf-attachment');
  const fileBtn = FORM.querySelector('[data-attach]');
  const fileNameOut = FORM.querySelector('[data-attach-name]');
  const submitBtn = FORM.querySelector('button[type="submit"]');
  const countEl = document.getElementById('cf-message-count');

  // Helpers: attach button opens hidden file input
  if (fileBtn && fileInput) {
    fileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      fileNameOut && (fileNameOut.textContent = f ? f.name : '');
    });
  }

  // Live character counter
  if (msgEl && countEl) {
    const max = Number(msgEl.getAttribute('maxlength') || 1000);
    const updateCount = () => {
      const len = (msgEl.value || '').length;
      countEl.textContent = `(${len} / ${max})`;
      countEl.classList.toggle('cf-count--warn', len > max * 0.85 && len < max);
      countEl.classList.toggle('cf-count--limit', len >= max);
    };
    msgEl.addEventListener('input', updateCount);
    updateCount();
  }

  // Inline status bubble
  function showStatus(type, text) {
    // type: 'ok' | 'err'
    let box = FORM.querySelector('.cf-status');
    if (!box) {
      box = document.createElement('div');
      box.className = 'cf-status';
      box.style.cssText =
        'margin-top:14px;padding:10px 12px;border-radius:10px;font-size:13px;line-height:1.45;' +
        'border:1px solid rgba(0,0,0,0.10);background:#eef6ef;color:#0d5226;';
      FORM.appendChild(box);
    }
    if (type === 'err') {
      box.style.background = '#fff1f0';
      box.style.color = '#7a0b00';
      box.style.borderColor = 'rgba(122,11,0,0.20)';
    } else {
      box.style.background = '#eef6ef';
      box.style.color = '#0d5226';
      box.style.borderColor = 'rgba(13,82,38,0.20)';
    }
    box.textContent = text;
  }

  function setSubmitting(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.style.opacity = on ? '0.7' : '1';
    submitBtn.textContent = on ? 'SENDING…' : (submitBtn.getAttribute('data-i18n') ? submitBtn.textContent : 'SEND');
  }

  function validate() {
    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const message = (msgEl?.value || '').trim();

    // Basic checks
    if (!name || !email || !message) {
      showStatus('err', 'Please fill out name, email, and your message.');
      return false;
    }
    // Quick email pattern (lightweight)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('err', 'Please enter a valid email address.');
      return false;
    }
    // Optional file size limit (10 MB)
    const f = fileInput?.files?.[0];
    if (f && f.size > 10 * 1024 * 1024) {
      showStatus('err', 'Attachment is too large. Maximum size is 10 MB.');
      return false;
    }
    return true;
  }

  async function submit(e) {
    e.preventDefault();
    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'REPLACE_WITH_YOUR_ACCESS_KEY') {
      showStatus('err', 'Missing Web3Forms Access Key. Please configure it in js/contact-submit.js.');
      return;
    }
    if (!validate()) return;

    try {
      setSubmitting(true);

      // Build multipart form data (Web3Forms expects certain fields)
      const fd = new FormData();
      fd.append('access_key', WEB3FORMS_ACCESS_KEY);
      // Email subject – customize if you want
      fd.append('subject', 'New website inquiry');
      // These keys are recognized by Web3Forms
      fd.append('name', (nameEl?.value || '').trim());
      fd.append('email', (emailEl?.value || '').trim());
      fd.append('message', (msgEl?.value || '').trim());

      // Attachment (Web3Forms supports attachments[]; multiple allowed)
      const f = fileInput?.files?.[0];
      if (f) {
        fd.append('attachments[]', f, f.name);
      }

      // Optional: honeypot (empty)
      fd.append('botcheck', '');

      // Submit
      const resp = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && (data.success === true || data.message === 'Submission successful')) {
        showStatus('ok', 'Thank you! Your message has been sent.');
        // Reset form
        FORM.reset();
        if (fileNameOut) fileNameOut.textContent = '';
        // Reset counter
        if (msgEl && countEl) {
          countEl.textContent = '(0 / ' + (msgEl.getAttribute('maxlength') || 1000) + ')';
          countEl.classList.remove('cf-count--warn', 'cf-count--limit');
        }
      } else {
        console.error('Web3Forms error:', data);
        const msg = data.message || 'Could not send your message. Please try again later.';
        showStatus('err', msg);
      }
    } catch (err) {
      console.error(err);
      showStatus('err', 'Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  FORM.addEventListener('submit', submit);
})();