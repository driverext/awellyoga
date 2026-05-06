import nodemailer from 'npm:nodemailer@6.10.1';

export const DEFAULT_STUDIO_TIMEZONE = 'America/New_York';

type SendEmailPayload = {
  toEmail: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export function normalizeEventType(value: string | null | undefined): 'retreat' | 'workshop' | 'class' {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'retreat' || normalized.includes('retreat')) {
    return 'retreat';
  }
  if (normalized === 'workshop' || normalized.includes('workshop')) {
    return 'workshop';
  }
  return 'class';
}

export function formatDateTime(value: string | null, timeZone: string): string {
  if (!value) {
    return 'TBD';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function formatAmount(amountTotal: number | null, currency: string | null): string | null {
  if (typeof amountTotal !== 'number' || Number.isNaN(amountTotal)) {
    return null;
  }

  const code = (currency || 'usd').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amountTotal / 100);
  } catch {
    return `${(amountTotal / 100).toFixed(2)} ${code}`;
  }
}

export function buildWhenLabel(dateLabel: string | null | undefined, startsAt: string, endsAt: string): string {
  const label = (dateLabel || '').trim();
  if (label) {
    return label;
  }

  if (!startsAt || startsAt === 'TBD') {
    return '';
  }

  return endsAt && endsAt !== 'TBD' ? `${startsAt} to ${endsAt}` : startsAt;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getInternalRecipients(instructorName?: string | null, eventType?: string | null): string[] {
  const recipients = new Set<string>();
  const adminEmail = 'info@awellyoga.com';
  if (isValidEmail(adminEmail)) {
    recipients.add(adminEmail);
  }

  if (normalizeEventType(eventType) !== 'class') {
    return [...recipients];
  }

  const teacherEmail = getTeacherEmail(instructorName);
  if (teacherEmail) {
    recipients.add(teacherEmail);
  }

  return [...recipients];
}

export function getTeacherEmail(instructorName?: string | null): string | null {
  const normalized = normalizeLooseName(instructorName || '');
  if (!normalized) {
    return null;
  }

  if (normalized.includes('arieta')) {
    return 'arietabk@gmail.com';
  }

  if (normalized.includes('sommer')) {
    return 'mysterious.garden.sanctuary@gmail.com';
  }

  return null;
}

function normalizeLooseName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export async function sendEmailViaConfiguredProvider(payload: SendEmailPayload): Promise<void> {
  const resendApiKey = (Deno.env.get('RESEND_API_KEY') || '').trim();
  const fromEmail = (Deno.env.get('BOOKING_EMAIL_FROM') || Deno.env.get('REMINDER_FROM_EMAIL') || '').trim();
  const defaultReplyTo = (Deno.env.get('BOOKING_EMAIL_REPLY_TO') || '').trim();
  const smtpHost = (Deno.env.get('SMTP_HOST') || '').trim();
  const smtpPortRaw = (Deno.env.get('SMTP_PORT') || '').trim();
  const smtpUser = (Deno.env.get('SMTP_USER') || '').trim();
  const smtpPass = (Deno.env.get('SMTP_PASS') || '').trim();
  const smtpSecureRaw = (Deno.env.get('SMTP_SECURE') || '').trim().toLowerCase();

  if (!fromEmail || !payload.toEmail || !isValidEmail(payload.toEmail)) {
    return;
  }

  const finalPayload = withClassListFooterIfInfo(payload);

  if (smtpHost && smtpUser && smtpPass) {
    const smtpPort = Number.parseInt(smtpPortRaw || '587', 10);
    const smtpSecure = smtpSecureRaw ? smtpSecureRaw === 'true' : smtpPort === 465;

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: fromEmail,
        to: [finalPayload.toEmail],
        replyTo: finalPayload.replyTo || defaultReplyTo || undefined,
        subject: finalPayload.subject,
        text: finalPayload.text,
        html: finalPayload.html
      });

      return;
    } catch (error) {
      console.error('SMTP booking email failed:', (error as Error).message);
    }
  }

  if (!resendApiKey) {
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [finalPayload.toEmail],
      reply_to: finalPayload.replyTo || defaultReplyTo || undefined,
      subject: finalPayload.subject,
      text: finalPayload.text,
      html: finalPayload.html
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to send booking email:', errorBody);
  }
}

function withClassListFooterIfInfo(payload: SendEmailPayload): SendEmailPayload {
  const to = payload.toEmail.trim().toLowerCase();
  if (to !== 'info@awellyoga.com') {
    return payload;
  }

  const classListUrl = (Deno.env.get('BOOKING_CLASS_LIST_URL') || 'https://awellyoga.com/dashboard').trim();
  const footerText = `If you would like to view full class list click here: ${classListUrl}`;
  const footerHtml = `<p style="margin-top:16px;">If you would like to view full class list <a href="${escapeHtml(classListUrl)}" target="_blank" rel="noopener noreferrer">click here</a>.</p>`;

  return {
    ...payload,
    text: `${payload.text}\n\n${footerText}`,
    html: `${payload.html}${footerHtml}`
  };
}
