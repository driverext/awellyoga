import nodemailer from 'npm:nodemailer@6.10.1';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

interface YttInterestPayload {
  email?: string;
  program?: string;
  cohort?: string;
  source?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) });
  }

  if (!isOriginAllowed(req)) {
    return json(req, { error: 'Origin not allowed.' }, 403);
  }

  if (req.method !== 'POST') {
    return json(req, { error: 'Method not allowed.' }, 405);
  }

  try {
    const payload = (await req.json()) as YttInterestPayload;
    const email = (payload.email || '').trim().toLowerCase();
    const program = (payload.program || 'NeuroYoga™ YTT 200').trim();
    const cohort = (payload.cohort || '2027').trim();
    const source = (payload.source || 'ytt-overlay').trim();

    if (!isValidEmail(email)) {
      return json(req, { error: 'A valid email address is required.' }, 400);
    }

    const smtpHost = (Deno.env.get('SMTP_HOST') || '').trim();
    const smtpPort = Number.parseInt((Deno.env.get('SMTP_PORT') || '587').trim(), 10);
    const smtpSecureRaw = (Deno.env.get('SMTP_SECURE') || '').trim().toLowerCase();
    const smtpSecure = smtpSecureRaw ? smtpSecureRaw === 'true' : smtpPort === 465;
    const smtpUser = (Deno.env.get('SMTP_USER') || '').trim();
    const smtpPass = (Deno.env.get('SMTP_PASS') || '').trim();
    const fromEmail = (Deno.env.get('BOOKING_EMAIL_FROM') || '').trim();
    const replyTo = (Deno.env.get('BOOKING_EMAIL_REPLY_TO') || '').trim();
    const toEmail = (Deno.env.get('YTT_INTEREST_TO') || 'info@awellyoga.com').trim();

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail || !toEmail) {
      return json(req, { error: 'Email service is not configured.' }, 500);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const subject = `New YTT Candidate Interest (${cohort})`;
    let text = [
      'A new YTT candidate requested updates.',
      '',
      `Email: ${email}`,
      `Program: ${program}`,
      `Cohort: ${cohort}`,
      `Source: ${source}`,
      `Submitted: ${new Date().toISOString()}`
    ].join('\n');

    let html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
        <h2 style="margin:0 0 12px;">New YTT Candidate Interest</h2>
        <p style="margin:0 0 6px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0 0 6px;"><strong>Program:</strong> ${escapeHtml(program)}</p>
        <p style="margin:0 0 6px;"><strong>Cohort:</strong> ${escapeHtml(cohort)}</p>
        <p style="margin:0 0 6px;"><strong>Source:</strong> ${escapeHtml(source)}</p>
        <p style="margin:0;"><strong>Submitted:</strong> ${new Date().toISOString()}</p>
      </div>
    `;

    if (toEmail.trim().toLowerCase() === 'info@awellyoga.com') {
      const classListUrl = (Deno.env.get('BOOKING_CLASS_LIST_URL') || 'https://awellyoga.com/dashboard').trim();
      text = `${text}\n\nIf you would like to view full class list click here: ${classListUrl}`;
      html = `${html}<p style="margin-top:16px;">If you would like to view full class list <a href="${escapeHtml(classListUrl)}" target="_blank" rel="noopener noreferrer">click here</a>.</p>`;
    }

    await transporter.sendMail({
      from: fromEmail,
      to: [toEmail],
      replyTo: replyTo || email,
      subject,
      text,
      html
    });

    return json(req, { ok: true, message: 'Interest submitted.' });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json'
    }
  });
}
