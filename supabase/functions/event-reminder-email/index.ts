import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import nodemailer from 'npm:nodemailer@6.10.1';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

type BookingRow = {
  id: string;
  event_title: string | null;
  event_start: string | null;
  event_location: string | null;
  stripe_customer_name: string | null;
  stripe_customer_email: string | null;
  booking_status: string | null;
  payment_status: string | null;
};

interface ReminderPayload {
  mode?: 'preview' | 'send-test' | 'send-all';
  eventTitle?: string;
  eventDatePrefix?: string;
  testEmail?: string;
  subject?: string;
  fromName?: string;
  message?: string;
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
    const authError = validateDashboardAuth(req);
    if (authError) {
      return json(req, { error: authError }, 401);
    }

    const payload = (await req.json()) as ReminderPayload;
    const mode = payload.mode || 'preview';
    const eventTitle = (payload.eventTitle || '').trim();
    const eventDatePrefix = (payload.eventDatePrefix || '').trim();
    const customMessage = (payload.message || '').trim();
    const subject = (payload.subject || `Reminder: ${eventTitle}`).trim();
    const fromName = (payload.fromName || 'Arieta').trim();

    if (!eventTitle || !eventDatePrefix || !customMessage) {
      return json(req, { error: 'eventTitle, eventDatePrefix, and message are required.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceRoleKey) {
      return json(req, { error: 'Missing Supabase environment variables.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin
      .from('bookings')
      .select('id, event_title, event_start, event_location, stripe_customer_name, stripe_customer_email, booking_status, payment_status')
      .eq('event_title', eventTitle)
      .eq('booking_status', 'paid')
      .order('event_start', { ascending: true })
      .order('stripe_customer_email', { ascending: true });

    if (error) {
      return json(req, { error: error.message }, 400);
    }

    const bookings = ((data || []) as BookingRow[]).filter((row) =>
      (row.event_start || '').startsWith(eventDatePrefix)
    );

    if (!bookings.length) {
      return json(req, { error: 'No paid bookings matched that event and date.' }, 404);
    }

    const location = bookings[0].event_location?.trim() || 'A-WELL Yoga';
    const dedupedRecipients = dedupeRecipients(bookings);
    const preview = buildReminderEmail({
      message: customMessage,
      fromName,
      subject,
      eventTitle,
      location
    });

    if (mode === 'preview') {
      return json(req, {
        ok: true,
        mode,
        matchCount: bookings.length,
        recipientCount: dedupedRecipients.length,
        recipients: dedupedRecipients,
        subject,
        html: preview.html,
        text: preview.text
      });
    }

    const smtpHost = (Deno.env.get('SMTP_HOST') || '').trim();
    const smtpPort = Number.parseInt((Deno.env.get('SMTP_PORT') || '587').trim(), 10);
    const smtpSecureRaw = (Deno.env.get('SMTP_SECURE') || '').trim().toLowerCase();
    const smtpSecure = smtpSecureRaw ? smtpSecureRaw === 'true' : smtpPort === 465;
    const smtpUser = (Deno.env.get('SMTP_USER') || '').trim();
    const smtpPass = (Deno.env.get('SMTP_PASS') || '').trim();
    const fromEmail = (Deno.env.get('BOOKING_EMAIL_FROM') || '').trim();
    const replyTo = (Deno.env.get('BOOKING_EMAIL_REPLY_TO') || '').trim();

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      return json(req, { error: 'Email service is not configured.' }, 500);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass }
    });

    if (mode === 'send-test') {
      const testEmail = (payload.testEmail || '').trim().toLowerCase();
      if (!isValidEmail(testEmail)) {
        return json(req, { error: 'A valid testEmail is required for send-test.' }, 400);
      }

      await transporter.sendMail({
        from: fromEmail,
        to: [testEmail],
        replyTo: replyTo || undefined,
        subject,
        text: preview.text,
        html: preview.html
      });

      return json(req, {
        ok: true,
        mode,
        sentTo: testEmail,
        recipientCount: 1,
        subject
      });
    }

    if (mode === 'send-all') {
      const sent: string[] = [];
      for (const recipient of dedupedRecipients) {
        await transporter.sendMail({
          from: fromEmail,
          to: [recipient.email],
          replyTo: replyTo || undefined,
          subject,
          text: personalizeText(preview.text, recipient.name),
          html: personalizeHtml(preview.html, recipient.name)
        });
        sent.push(recipient.email);
      }

      return json(req, {
        ok: true,
        mode,
        sentCount: sent.length,
        sent
      });
    }

    return json(req, { error: 'Unsupported mode.' }, 400);
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function dedupeRecipients(bookings: BookingRow[]) {
  const map = new Map<string, { email: string; name: string }>();
  for (const row of bookings) {
    const email = (row.stripe_customer_email || '').trim().toLowerCase();
    if (!isValidEmail(email) || map.has(email)) continue;
    map.set(email, {
      email,
      name: row.stripe_customer_name?.trim() || 'there'
    });
  }
  return [...map.values()];
}

function buildReminderEmail(input: { message: string; fromName: string; subject: string; eventTitle: string; location: string }) {
  const bodyHtml = input.message
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.75;color:#2a2a2a;">${escapeHtml(line)}</p>`)
    .join('');

  const bodyText = input.message.trim();

  const html = `
    <div style="margin:0;padding:24px;background:#f5f1ea;font-family:Georgia,'Times New Roman',serif;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;background:#fffdf9;border:1px solid #e8dfd2;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(48,35,20,0.08);">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#f8f0e4 0%,#fff8f1 100%);border-bottom:1px solid #efe3d5;">
          <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#86654a;">A-WELL YOGA</p>
          <h1 style="margin:0;font-size:30px;line-height:1.15;color:#3e2d22;">Yoga Glow Reminder</h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:#6c5847;">New Smyrna Beach | Ocean practice + brunch connection</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#2a2a2a;">Hi {{NAME}},</p>
          ${bodyHtml}
          <div style="margin:22px 0 0;padding:18px 20px;background:#fcf7f0;border:1px solid #eee2d4;border-radius:14px;">
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#8b6d56;">Meeting Point</p>
            <p style="margin:0;font-size:16px;line-height:1.75;color:#2a2a2a;"><strong>${escapeHtml(input.location)}</strong></p>
          </div>
          <p style="margin:22px 0 0;font-size:16px;line-height:1.75;color:#2a2a2a;">With warmth,<br>${escapeHtml(input.fromName)}</p>
        </div>
      </div>
    </div>
  `;

  return { html, text: `Hi {{NAME}},\n\n${bodyText}\n\nWith warmth,\n${input.fromName}` };
}

function personalizeHtml(html: string, name: string) {
  return html.replaceAll('{{NAME}}', escapeHtml(name || 'there'));
}

function personalizeText(text: string, name: string) {
  return text.replaceAll('{{NAME}}', name || 'there');
}

function validateDashboardAuth(req: Request): string | null {
  const expectedUser = Deno.env.get('DASHBOARD_USERNAME') || '';
  const expectedPass = Deno.env.get('DASHBOARD_PASSWORD') || '';
  if (!expectedUser || !expectedPass) {
    return 'Dashboard credentials are not configured.';
  }

  const header = req.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) {
    return 'Missing dashboard authorization.';
  }

  const encoded = header.slice(6).trim();
  const decoded = decodeBase64(encoded);
  if (!decoded) {
    return 'Invalid dashboard authorization.';
  }

  const [user, ...rest] = decoded.split(':');
  const pass = rest.join(':');
  if (!timingSafeEqual(user, expectedUser) || !timingSafeEqual(pass, expectedPass)) {
    return 'Invalid dashboard credentials.';
  }

  return null;
}

function decodeBase64(value: string): string | null {
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

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
