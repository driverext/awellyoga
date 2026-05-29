import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';
import { escapeHtml, sendEmailViaConfiguredProvider } from '../_shared/email.ts';

type DashboardAccessPayload = {
  toEmail?: string;
  recipientName?: string;
  username?: string;
  password?: string;
  loginUrl?: string;
  dashboardLabel?: string;
  subjectPrefix?: string;
};

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
    const payload = (await req.json()) as DashboardAccessPayload;
    const toEmail = (payload.toEmail || '').trim().toLowerCase();
    const recipientName = (payload.recipientName || '').trim();
    const username = (payload.username || '').trim();
    const password = (payload.password || '').trim();
    const loginUrl = (payload.loginUrl || 'https://awellyoga.com/dashboard/login').trim();
    const dashboardLabel = (payload.dashboardLabel || 'retreat dashboard').trim();
    const subjectPrefix = (payload.subjectPrefix || '').trim();

    if (!toEmail || !username || !password || !loginUrl) {
      return json(req, { error: 'Missing required dashboard access email fields.' }, 400);
    }

    const greetingName = recipientName || 'Melita';
    const subject = `${subjectPrefix ? `${subjectPrefix} ` : ''}A-WELL Yoga Dashboard Access`.trim();
    const text = [
      `Hi ${greetingName},`,
      '',
      `Here is your login for the A-WELL Yoga ${dashboardLabel}.`,
      '',
      `Login page: ${loginUrl}`,
      `Username: ${username}`,
      `Password: ${password}`,
      '',
      'Once you sign in, the system will route you to the correct dashboard automatically.',
      '',
      'A-WELL Yoga'
    ].join('\n');

    const html = `
      <div style="margin:0;padding:32px 18px;background:#f7f1ea;font-family:Arial,sans-serif;color:#2f261f;">
        <div style="max-width:620px;margin:0 auto;background:#fffaf5;border:1px solid #e7d7c8;border-radius:24px;overflow:hidden;box-shadow:0 16px 40px rgba(63,39,24,0.08);">
          <div style="padding:28px 28px 18px;background:linear-gradient(145deg,#2f4a36 0%,#6f4c39 100%);color:#fff7f0;">
            <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;opacity:0.88;">A-WELL Yoga</p>
            <h1 style="margin:0;font-size:30px;line-height:1.1;color:#fff7f0;">Your dashboard access is ready.</h1>
          </div>

          <div style="padding:28px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi ${escapeHtml(greetingName)},</p>
            <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
              Here is your login for the A-WELL Yoga ${escapeHtml(dashboardLabel)}.
            </p>

            <div style="margin:0 0 22px;padding:18px;border-radius:18px;background:#f5ece3;border:1px solid #e3d2c2;">
              <p style="margin:0 0 8px;font-size:14px;color:#6f5b4a;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Login details</p>
              <p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Username:</strong> ${escapeHtml(username)}</p>
              <p style="margin:0;font-size:16px;line-height:1.6;"><strong>Password:</strong> ${escapeHtml(password)}</p>
            </div>

            <div style="margin:0 0 22px;text-align:center;">
              <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#2f4a36;color:#fffaf5;text-decoration:none;font-weight:700;font-size:15px;">
                Open Dashboard Login
              </a>
            </div>

            <p style="margin:0 0 10px;font-size:15px;line-height:1.7;color:#58473a;">
              Once you sign in, the system will route you to the correct dashboard automatically.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#7a6758;">
              Login page: <a href="${escapeHtml(loginUrl)}" style="color:#6f4c39;">${escapeHtml(loginUrl)}</a>
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmailViaConfiguredProvider({
      toEmail,
      subject,
      text,
      html
    });

    return json(req, { ok: true, message: 'Dashboard access email sent.' });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json'
    }
  });
}
