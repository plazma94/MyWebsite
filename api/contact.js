// Vercel serverless function: /api/contact
// Sends email via SMTP using Nodemailer. Configure credentials with env vars.
// Attachments supported via base64 JSON payload.

const nodemailer = require('nodemailer');

function bool(v, def = false) {
  if (v == null) return def;
  return String(v).toLowerCase() === 'true';
}

module.exports = async (req, res) => {
  // CORS preflight (optional if same-origin)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const {
      name = '',
      email = '',
      phone = '',
      message = '',
      attachment = null,
    } = req.body || {};

    if (!email || !message) {
      return res.status(400).json({ ok: false, error: 'Email and message are required.' });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = bool(process.env.SMTP_SECURE, port === 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return res.status(500).json({ ok: false, error: 'SMTP is not configured.' });
    }

    const transporter = nodemailer.createTransport({
      host, port, secure,
      auth: { user, pass },
    });

    const siteName = process.env.SITE_NAME || 'Website';
    const to = process.env.MAIL_TO || user;
    const from = process.env.MAIL_FROM || `${siteName} <${user}>`;

    const subject = `[${siteName}] New inquiry${name ? ` from ${name}` : ''}`;

    const textLines = [
      `Name: ${name || '(n/a)'}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      '',
      'Message:',
      message,
    ].filter(Boolean);

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.4;color:#111">
        <p><strong>${siteName}</strong> — New inquiry</p>
        <p><strong>Name:</strong> ${name ? escapeHtml(name) : '(n/a)'}<br/>
           <strong>Email:</strong> ${escapeHtml(email)}<br/>
           ${phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}<br/>` : ''}
        </p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    const attachments = [];
    if (attachment?.contentBase64 && attachment?.filename) {
      attachments.push({
        filename: attachment.filename,
        content: Buffer.from(attachment.contentBase64, 'base64'),
        contentType: attachment.contentType || 'application/octet-stream',
      });
    }

    await transporter.sendMail({
      from,
      to,
      replyTo: email, // replies go to the sender
      subject,
      text: textLines.join('\n'),
      html,
      attachments,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ ok: false, error: 'Internal error sending email.' });
  }
};

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}