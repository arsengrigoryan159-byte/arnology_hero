import crypto from 'node:crypto';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_TIMES = new Set(['10:00', '11:30', '14:00', '15:30']);

function clean(value, maximum) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sendJson(response, status, payload) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(status).json(payload);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, message: 'Method not allowed.' });
  }

  const body = typeof request.body === 'string'
    ? (() => {
        try { return JSON.parse(request.body); } catch { return {}; }
      })()
    : request.body ?? {};

  // Quietly accept automated form submissions without delivering them.
  if (clean(body.website, 200)) return sendJson(response, 200, { ok: true });

  const requestData = {
    name: clean(body.name, 100),
    email: clean(body.email, 160).toLowerCase(),
    company: clean(body.company, 120),
    role: clean(body.role, 100),
    facilities: clean(body.facilities, 30),
    phone: clean(body.phone, 40),
    notes: clean(body.notes, 1200),
    date: clean(body.date, 10),
    time: clean(body.time, 5),
    timezone: clean(body.timezone, 100)
  };

  if (!requestData.name || !requestData.company || !EMAIL_PATTERN.test(requestData.email)) {
    return sendJson(response, 400, { ok: false, message: 'Enter a valid name, work email, and company.' });
  }

  if (!DATE_PATTERN.test(requestData.date) || !ALLOWED_TIMES.has(requestData.time) || !requestData.timezone) {
    return sendJson(response, 400, { ok: false, message: 'Choose a valid preferred date and time.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.DEMO_REQUEST_TO_EMAIL;
  const fromEmail = process.env.DEMO_REQUEST_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) {
    return sendJson(response, 503, {
      ok: false,
      message: 'Demo requests are temporarily unavailable. Please try again later.'
    });
  }

  const requestId = crypto.randomUUID();
  const fields = [
    ['Name', requestData.name],
    ['Work email', requestData.email],
    ['Company', requestData.company],
    ['Role', requestData.role || 'Not supplied'],
    ['Facilities', requestData.facilities || 'Not supplied'],
    ['Phone', requestData.phone || 'Not supplied'],
    ['Preferred date', requestData.date],
    ['Preferred time', requestData.time],
    ['Time zone', requestData.timezone],
    ['Questions or priorities', requestData.notes || 'Not supplied'],
    ['Request ID', requestId]
  ];
  const text = fields.map(([label, value]) => `${label}: ${value}`).join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.6;max-width:680px">
      <h1 style="color:#0f172a;font-size:24px">New SlfStrg demo request</h1>
      <p>A visitor selected a preferred 30-minute demo slot. Confirm the time with them directly.</p>
      <table style="width:100%;border-collapse:collapse">
        ${fields.map(([label, value]) => `
          <tr>
            <th style="padding:9px 12px;border:1px solid #e2e8f0;background:#f8fafc;text-align:left;vertical-align:top;width:175px">${escapeHtml(label)}</th>
            <td style="padding:9px 12px;border:1px solid #e2e8f0;white-space:pre-wrap">${escapeHtml(value)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `slfstrg-demo-${requestId}`,
        'User-Agent': 'SlfStrgLanding/1.0'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: requestData.email,
        subject: `New SlfStrg demo request — ${requestData.company}`,
        text,
        html
      })
    });

    if (!resendResponse.ok) {
      return sendJson(response, 502, {
        ok: false,
        message: 'The request could not be delivered right now. Please try again later.'
      });
    }

    return sendJson(response, 200, { ok: true, requestId });
  } catch {
    return sendJson(response, 502, {
      ok: false,
      message: 'The request could not be delivered right now. Please try again later.'
    });
  }
}
