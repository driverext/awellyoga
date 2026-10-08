import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { sendBookingConfirmationEmail, sendInternalBookingAlert } from '../_shared/booking-emails.ts';
import { NEURONIDRA_EVENT, NEURONIDRA_DATE_LABEL } from '../../../shared/neuronidra-event.ts';

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
        phone?: string;
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
    const collectedPhone = session.customer_details?.phone || '';
    const collectedWhatsapp =
      session.custom_fields?.find((field) => field?.key === 'whatsapp')?.text?.value ||
      metadata.customer_whatsapp ||
      '';
    const backupContact = collectedWhatsapp || collectedPhone;

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
          stripe_customer_whatsapp: backupContact || null,
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
        customerBackupContact: backupContact || null,
        eventType: metadata.event_type || null,
        instructorName: metadata.instructor_name || null,
        eventTitle: metadata.event_title || null,
        eventStart: metadata.event_start || null,
        eventEnd: metadata.event_end || null,
        eventDateLabel: metadata.sanity_event_id === NEURONIDRA_EVENT.id ? NEURONIDRA_DATE_LABEL : metadata.event_dates_label || null,
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
