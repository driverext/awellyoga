import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      client_reference_id?: string;
      customer_details?: { email?: string };
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      payment_intent?: string;
      expires_at?: number;
      metadata?: Record<string, string>;
    };
  };
};

const WEBHOOK_TOLERANCE_SECONDS = 300;
const DEFAULT_STUDIO_TIMEZONE = 'America/New_York';

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
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: duplicateEvent } = await admin
      .from('bookings')
      .select('id')
      .eq('raw_stripe_event_id', event.id)
      .limit(1);

    if (duplicateEvent && duplicateEvent.length > 0) {
      return json({ received: true, ignored: true, reason: 'duplicate event' });
    }

    const session = event.data.object;
    const metadata = session.metadata || {};
    const bookingId = metadata.booking_id || session.client_reference_id || '';

    if (!bookingId) {
      return json({ received: true, ignored: true, reason: 'missing booking id' });
    }

    if (event.type === 'checkout.session.completed') {
      const { error } = await admin
        .from('bookings')
        .update({
          stripe_session_id: session.id,
          stripe_customer_name: session.customer_details?.name || null,
          stripe_customer_email: session.customer_details?.email || null,
          stripe_payment_intent_id: session.payment_intent || null,
          amount_total: session.amount_total ?? null,
          currency: session.currency || null,
          payment_status: session.payment_status || 'paid',
          booking_status: 'paid',
          reservation_expires_at: null,
          raw_stripe_event_id: event.id
        })
        .eq('id', bookingId);

      if (error) {
        return json({ error: error.message }, 400);
      }

      // Confirmation emails are best-effort and must never block webhook acknowledgement.
      await sendBookingConfirmationEmail({
        toEmail: session.customer_details?.email || metadata.customer_email || '',
        customerName: session.customer_details?.name || '',
        eventTitle: metadata.event_title || null,
        eventStart: metadata.event_start || null,
        eventEnd: metadata.event_end || null,
        eventLocation: metadata.event_location || null,
        amountTotal: session.amount_total ?? null,
        currency: session.currency || null
      });
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
  eventTitle: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  eventLocation: string | null;
  amountTotal: number | null;
  currency: string | null;
};

async function sendBookingConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {
  const resendApiKey = (Deno.env.get('RESEND_API_KEY') || '').trim();
  const fromEmail = (Deno.env.get('BOOKING_EMAIL_FROM') || Deno.env.get('REMINDER_FROM_EMAIL') || '').trim();
  const replyTo = (Deno.env.get('BOOKING_EMAIL_REPLY_TO') || '').trim();
  const timezone = (Deno.env.get('BOOKING_EMAIL_TIMEZONE') || DEFAULT_STUDIO_TIMEZONE).trim();

  const toEmail = payload.toEmail.trim().toLowerCase();
  if (!resendApiKey || !fromEmail || !toEmail || !isValidEmail(toEmail)) {
    return;
  }

  const customerName = payload.customerName.trim() || 'there';
  const eventTitle = payload.eventTitle?.trim() || 'your class';
  const startsAt = formatDateTime(payload.eventStart, timezone);
  const endsAt = formatDateTime(payload.eventEnd, timezone);
  const location = payload.eventLocation?.trim() || 'A-WELL Yoga';
  const amountLabel = formatAmount(payload.amountTotal, payload.currency);

  const subject = `Booking Confirmed: ${eventTitle}`;
  const text = [
    `Hi ${customerName},`,
    '',
    `You're confirmed for ${eventTitle}.`,
    '',
    `When: ${startsAt}${endsAt ? ` to ${endsAt}` : ''}`,
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

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>You&apos;re confirmed for <strong>${escapeHtml(eventTitle)}</strong>.</p>
      <p><strong>When:</strong> ${escapeHtml(startsAt)}${endsAt ? ` to ${escapeHtml(endsAt)}` : ''}<br/>
      <strong>Where:</strong> ${escapeHtml(location)}${amountLabel ? `<br/><strong>Paid:</strong> ${escapeHtml(amountLabel)}` : ''}</p>
      <p>Please bring anything listed in the class description (mat, water, etc.).<br/>
      If you need to make changes, reply to this email.</p>
      <p>See you soon,<br/>A-WELL Yoga</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: replyTo || undefined,
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to send booking confirmation email:', errorBody);
  }
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
