import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import nodemailer from 'npm:nodemailer@6.10.1';

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      client_reference_id?: string;
      customer_details?: {
        email?: string;
        name?: string;
        individual_name?: string;
        business_name?: string;
      };
      collected_information?: {
        individual_name?: string;
        business_name?: string;
      };
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      payment_intent?: string;
      expires_at?: number;
      metadata?: Record<string, string>;
      custom_fields?: Array<{
        key?: string;
        type?: string;
        text?: { value?: string };
      }>;
      presentment_details?: {
        presentment_amount?: number;
        presentment_currency?: string;
      };
    };
  };
};

const WEBHOOK_TOLERANCE_SECONDS = 300;
const DEFAULT_STUDIO_TIMEZONE = 'America/New_York';
const SUPPORTED_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'checkout.session.expired'
]);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!stripeWebhookSecret || !supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Missing webhook environment variables.' }, 500);
    }

    const signature = req.headers.get('stripe-signature') || '';
    const payload = await req.text();
    const isValid = await verifyStripeSignature(payload, signature, stripeWebhookSecret);
    if (!isValid) {
      return json({ error: 'Invalid Stripe signature.' }, 400);
    }

    const event = JSON.parse(payload) as StripeEvent;

    if (!SUPPORTED_EVENT_TYPES.has(event.type)) {
      return json({ received: true, ignored: true, reason: 'unsupported event type' });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const session = event.data.object;
    const metadata = session.metadata || {};
    const bookingId = metadata.booking_id || session.client_reference_id || '';
    const collectedName =
      session.customer_details?.individual_name ||
      session.customer_details?.name ||
      session.collected_information?.individual_name ||
      session.customer_details?.business_name ||
      session.collected_information?.business_name ||
      '';
    const collectedWhatsapp =
      session.custom_fields?.find((field) => field?.key === 'whatsapp')?.text?.value ||
      metadata.customer_whatsapp ||
      '';

    if (!bookingId) {
      return json({ received: true, ignored: true, reason: 'missing booking id' });
    }

    const { data: duplicateEvent } = await admin
      .from('bookings')
      .select('id')
      .eq('raw_stripe_event_id', event.id)
      .limit(1);

    if (duplicateEvent && duplicateEvent.length > 0) {
      return json({ received: true, ignored: true, reason: 'duplicate event' });
    }

    if (event.type === 'checkout.session.completed') {
      const presentmentAmount = session.presentment_details?.presentment_amount ?? session.amount_total ?? null;
      const presentmentCurrency = session.presentment_details?.presentment_currency || session.currency || null;

      const { error } = await admin
        .from('bookings')
        .update({
          stripe_session_id: session.id,
          stripe_customer_name: collectedName || null,
          stripe_customer_email: session.customer_details?.email || null,
          stripe_customer_whatsapp: collectedWhatsapp || null,
          stripe_payment_intent_id: session.payment_intent || null,
          amount_total: presentmentAmount,
          currency: presentmentCurrency,
          payment_status: session.payment_status || 'paid',
          booking_status: 'paid',
          reservation_expires_at: null,
          raw_stripe_event_id: event.id
        })
        .eq('id', bookingId);

      if (error) {
        return json({ error: error.message }, 400);
      }

      const emailPayload = {
        toEmail: session.customer_details?.email || metadata.customer_email || '',
        customerName: collectedName,
        customerWhatsApp: collectedWhatsapp || null,
        eventTitle: metadata.event_title || null,
        eventStart: metadata.event_start || null,
        eventEnd: metadata.event_end || null,
        eventDateLabel: metadata.event_dates_label || null,
        eventLocation: metadata.event_location || null,
        amountTotal: presentmentAmount,
        currency: presentmentCurrency
      };

      // Emails are best-effort and must never block webhook acknowledgement.
      try {
        await sendBookingConfirmationEmail(emailPayload);
      } catch (error) {
        console.error('Customer booking confirmation failed:', (error as Error).message);
      }

      try {
        await sendInternalBookingAlert({
          ...emailPayload,
          bookingId
        });
      } catch (error) {
        console.error('Internal booking alert failed:', (error as Error).message);
      }
    } else if (event.type === 'checkout.session.expired') {
      const { error } = await admin
        .from('bookings')
        .update({
          payment_status: 'expired',
          booking_status: 'expired',
          reservation_expires_at: null,
          raw_stripe_event_id: event.id
        })
        .eq('id', bookingId);

      if (error) {
        return json({ error: error.message }, 400);
      }
    } else {
      return json({ received: true, ignored: true });
    }

    return json({ received: true });
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const v1 = parts.find((part) => part.startsWith('v1='))?.slice(3);

  if (!timestamp || !v1) {
    return false;
  }

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

  return timingSafeEqual(expected, v1);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

type ConfirmationEmailPayload = {
  toEmail: string;
  customerName: string;
  customerWhatsApp?: string | null;
  eventTitle: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  eventDateLabel?: string | null;
  eventLocation: string | null;
  amountTotal: number | null;
  currency: string | null;
};

type InternalAlertPayload = ConfirmationEmailPayload & {
  bookingId: string;
};

async function sendBookingConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {
  const timezone = (Deno.env.get('BOOKING_EMAIL_TIMEZONE') || DEFAULT_STUDIO_TIMEZONE).trim();

  const toEmail = payload.toEmail.trim().toLowerCase();
  if (!toEmail || !isValidEmail(toEmail)) {
    return;
  }

  const customerName = payload.customerName.trim() || 'there';
  const eventTitle = payload.eventTitle?.trim() || 'your class';
  const startsAt = formatDateTime(payload.eventStart, timezone);
  const endsAt = formatDateTime(payload.eventEnd, timezone);
  const whenLabel = buildWhenLabel(payload.eventDateLabel, startsAt, endsAt);
  const location = payload.eventLocation?.trim() || 'A-WELL Yoga';
  const amountLabel = formatAmount(payload.amountTotal, payload.currency);

  const isYogaGlow = eventTitle.toLowerCase() === 'yoga glow';
  const subject = `Booking Confirmed: ${eventTitle}`;
  const text = isYogaGlow
    ? [
        'You’re officially booked for Yoga Glow.',
        '',
        'We’ll meet by the ocean — not just for a class, but for an experience.',
        '',
        '⸻',
        '',
        'Event Details',
        '',
        '📍 Location: Flagler Avenue, New Smyrna Beach',
        'Meet at LUMA Caffè',
        '🕒 Time: 10:00 AM',
        '📅 Date: May 2nd, 2026',
        '',
        '⸻',
        '',
        'What to bring',
        '',
        'A towel or yoga mat',
        'Water',
        'Comfortable clothing you can move in',
        'An open mind (this one matters most)',
        '',
        '⸻',
        '',
        'I’ll provide the immersive headsets, so you can drop fully into the experience.',
        '',
        '⸻',
        '',
        'Take a breath before you arrive.',
        'Let the ocean do the rest.',
        '',
        '⸻',
        '',
        'I can’t wait to share this with you.',
        '',
        '—',
        'Arieta',
        'A-WELL YOGA 🤍'
      ].join('\n')
    : [
        `Hi ${customerName},`,
        '',
        `You're confirmed for ${eventTitle}.`,
        '',
        whenLabel ? `When: ${whenLabel}` : null,
        `Where: ${location}`,
        amountLabel ? `Paid: ${amountLabel}` : null,
        '',
        'Please bring anything listed in the class description (mat, water, etc.).',
        'If you need to make changes, reply to this email.',
        '',
        'See you soon,',
        'A-WELL Yoga'
      ]
        .filter(Boolean)
        .join('\n');

  const html = isYogaGlow
    ? `
    <div style="margin:0;padding:24px;background:#f6f3ef;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e1d8;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#f7efe5 0%,#fff7ee 100%);border-bottom:1px solid #efe5d9;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#7d6651;">A-WELL YOGA</p>
          <h1 style="margin:0;font-size:26px;line-height:1.2;color:#3f2f24;">You&rsquo;re officially booked for Yoga Glow.</h1>
        </div>

        <div style="padding:24px 28px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">We&rsquo;ll meet by the ocean &mdash; not just for a class, but for an experience.</p>

          <hr style="border:none;border-top:1px solid #efe5d9;margin:18px 0;" />

          <h2 style="margin:0 0 14px;font-size:18px;color:#4f3b2d;">Event Details</h2>
          <div style="background:#fcf9f4;border:1px solid #eee3d8;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.7;">
            <div>📍 <strong>Location:</strong> Flagler Avenue, New Smyrna Beach</div>
            <div>Meet at LUMA Caffè</div>
            <div>🕒 <strong>Time:</strong> 10:00 AM</div>
            <div>📅 <strong>Date:</strong> May 2nd, 2026</div>
          </div>

          <hr style="border:none;border-top:1px solid #efe5d9;margin:18px 0;" />

          <h2 style="margin:0 0 12px;font-size:18px;color:#4f3b2d;">What to bring</h2>
          <ul style="margin:0 0 4px 20px;padding:0;font-size:15px;line-height:1.7;">
            <li>A towel or yoga mat</li>
            <li>Water</li>
            <li>Comfortable clothing you can move in</li>
            <li>An open mind (this one matters most)</li>
          </ul>

          <hr style="border:none;border-top:1px solid #efe5d9;margin:18px 0;" />

          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">I&rsquo;ll provide the immersive headsets, so you can drop fully into the experience.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Take a breath before you arrive.<br/>Let the ocean do the rest.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">I can&rsquo;t wait to share this with you.</p>
          <p style="margin:0;font-size:15px;line-height:1.7;">&mdash;<br/>Arieta<br/>A-WELL YOGA 🤍</p>
        </div>
      </div>
    </div>
  `
    : `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>You&apos;re confirmed for <strong>${escapeHtml(eventTitle)}</strong>.</p>
      <p>${whenLabel ? `<strong>When:</strong> ${escapeHtml(whenLabel)}<br/>` : ''}
      <strong>Where:</strong> ${escapeHtml(location)}${amountLabel ? `<br/><strong>Paid:</strong> ${escapeHtml(amountLabel)}` : ''}</p>
      <p>Please bring anything listed in the class description (mat, water, etc.).<br/>
      If you need to make changes, reply to this email.</p>
      <p>See you soon,<br/>A-WELL Yoga</p>
    </div>
  `;

  await sendEmailViaConfiguredProvider({
    toEmail,
    subject,
    text,
    html
  });
}

async function sendInternalBookingAlert(payload: InternalAlertPayload): Promise<void> {
  const timezone = (Deno.env.get('BOOKING_EMAIL_TIMEZONE') || DEFAULT_STUDIO_TIMEZONE).trim();
  const notifyTo = (Deno.env.get('BOOKING_NOTIFY_TO') || 'info@awellyoga.com').trim().toLowerCase();

  if (!notifyTo || !isValidEmail(notifyTo)) {
    return;
  }

  const eventTitle = payload.eventTitle?.trim() || 'Untitled Event';
  const startsAt = formatDateTime(payload.eventStart, timezone);
  const endsAt = formatDateTime(payload.eventEnd, timezone);
  const whenLabel = buildWhenLabel(payload.eventDateLabel, startsAt, endsAt);
  const location = payload.eventLocation?.trim() || 'A-WELL Yoga';
  const amountLabel = formatAmount(payload.amountTotal, payload.currency) || 'Unknown';
  const customerName = payload.customerName?.trim() || 'Unknown';
  const customerEmail = payload.toEmail?.trim().toLowerCase() || 'Unknown';
  const customerWhatsApp = payload.customerWhatsApp?.trim() || '';

  const subject = `New Booking: ${eventTitle} (${customerName})`;
  const text = [
    'A new booking was paid.',
    '',
    `Booking ID: ${payload.bookingId}`,
    `Customer: ${customerName}`,
    `Customer Email: ${customerEmail}`,
    customerWhatsApp ? `Customer WhatsApp: ${customerWhatsApp}` : null,
    `Event: ${eventTitle}`,
    whenLabel ? `When: ${whenLabel}` : null,
    `Location: ${location}`,
    `Amount: ${amountLabel}`,
    `Received: ${new Date().toISOString()}`
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
      <h2 style="margin:0 0 12px;">New Booking Paid</h2>
      <p style="margin:0 0 6px;"><strong>Booking ID:</strong> ${escapeHtml(payload.bookingId)}</p>
      <p style="margin:0 0 6px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin:0 0 6px;"><strong>Customer Email:</strong> ${escapeHtml(customerEmail)}</p>
      ${customerWhatsApp ? `<p style="margin:0 0 6px;"><strong>Customer WhatsApp:</strong> ${escapeHtml(customerWhatsApp)}</p>` : ''}
      <p style="margin:0 0 6px;"><strong>Event:</strong> ${escapeHtml(eventTitle)}</p>
      ${whenLabel ? `<p style="margin:0 0 6px;"><strong>When:</strong> ${escapeHtml(whenLabel)}</p>` : ''}
      <p style="margin:0 0 6px;"><strong>Location:</strong> ${escapeHtml(location)}</p>
      <p style="margin:0;"><strong>Amount:</strong> ${escapeHtml(amountLabel)}</p>
    </div>
  `;

  await sendEmailViaConfiguredProvider({
    toEmail: notifyTo,
    subject,
    text,
    html,
    replyTo: customerEmail !== 'Unknown' ? customerEmail : undefined
  });
}

type SendEmailPayload = {
  toEmail: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

async function sendEmailViaConfiguredProvider(payload: SendEmailPayload): Promise<void> {
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

  // Prefer SMTP when configured (e.g. Namecheap Private Email).
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
      // Fall through to Resend if available.
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

function buildWhenLabel(dateLabel: string | null | undefined, startsAt: string, endsAt: string): string {
  const label = (dateLabel || '').trim();
  if (label) {
    return label;
  }

  if (!startsAt || startsAt === 'TBD') {
    return '';
  }

  return endsAt && endsAt !== 'TBD' ? `${startsAt} to ${endsAt}` : startsAt;
}

function formatDateTime(value: string | null, timeZone: string): string {
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

function formatAmount(amountTotal: number | null, currency: string | null): string | null {
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
