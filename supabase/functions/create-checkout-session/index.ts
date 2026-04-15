import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

interface CreateCheckoutPayload {
  eventId: string;
  title: string;
  instructorName?: string;
  instructorStripeAccountId?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  priceLabel?: string;
  stripePriceId?: string;
  bookingUrl?: string;
  platformFeePercent?: number;
  maxSpots?: number;
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405);
    }

    const payload = (await req.json()) as CreateCheckoutPayload;
    if (!payload?.eventId || !payload?.title || !payload?.startDate) {
      return json({ error: 'Missing event id, title, or start date.' }, 400);
    }

    const email = (payload.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return json({ error: 'A valid email address is required.' }, 400);
    }

    if (!payload.stripePriceId) {
      if (payload.bookingUrl) {
        return json({
          fallbackUrl: payload.bookingUrl,
          message: 'This event uses a direct payment link fallback because no Stripe Price ID is set.'
        });
      }
      return json({
        error: 'No Stripe Price ID was configured for this event. Add one in Sanity before booking.'
      }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey) {
      return json({ error: 'Missing Supabase or Stripe environment variables.' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const maxSpots = Number(payload.maxSpots || 0);
    if (maxSpots > 0) {
      const { data: existingBookings, error: countError } = await supabase
        .from('bookings')
        .select('id, booking_status, reservation_expires_at')
        .eq('sanity_event_id', payload.eventId);

      if (countError) {
        return json({ error: countError.message }, 400);
      }

      const now = new Date();
      const activeCount = (existingBookings || []).filter((booking) => {
        if (booking.booking_status === 'paid') {
          return true;
        }

        if (booking.booking_status === 'pending' && booking.reservation_expires_at) {
          return new Date(booking.reservation_expires_at) > now;
        }

        return false;
      }).length;

      if (activeCount >= maxSpots) {
        return json(
          {
            error: 'This class is full.',
            code: 'CLASS_FULL'
          },
          409
        );
      }
    }

    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { data: insertedBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        sanity_event_id: payload.eventId,
        event_title: payload.title,
        event_start: payload.startDate,
        event_end: payload.endDate || null,
        event_location: payload.location || null,
        stripe_customer_email: email,
        payment_status: 'pending',
        booking_status: 'pending',
        reservation_expires_at: reservationExpiresAt
      })
      .select('id')
      .single();

    if (insertError || !insertedBooking?.id) {
      return json({ error: insertError?.message || 'Could not reserve this class spot.' }, 400);
    }

    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'http://localhost:4200';
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/schedule#calendar`;

    const body = new URLSearchParams();
    body.set('mode', 'payment');
    body.set('success_url', successUrl);
    body.set('cancel_url', cancelUrl);
    body.set('line_items[0][price]', payload.stripePriceId);
    body.set('line_items[0][quantity]', '1');
    body.set('customer_email', email);
    body.set('client_reference_id', insertedBooking.id);
    body.set('metadata[booking_id]', insertedBooking.id);
    body.set('metadata[sanity_event_id]', payload.eventId);
    body.set('metadata[event_title]', payload.title);
    body.set('metadata[instructor_name]', payload.instructorName || '');
    body.set('metadata[event_start]', payload.startDate);
    body.set('metadata[event_end]', payload.endDate || '');
    body.set('metadata[event_location]', payload.location || '');
    body.set('metadata[price_label]', payload.priceLabel || '');
    body.set('metadata[max_spots]', maxSpots > 0 ? String(maxSpots) : '');

    const destinationAccount = (payload.instructorStripeAccountId || '').trim();
    const platformFeePercent = clampPercent(payload.platformFeePercent);
    if (destinationAccount.startsWith('acct_') && platformFeePercent > 0) {
      const priceInfo = await fetchStripePrice(payload.stripePriceId, stripeSecretKey);
      const unitAmount = priceInfo?.unit_amount ?? null;
      if (typeof unitAmount === 'number' && unitAmount > 0) {
        const feeAmount = Math.max(0, Math.round((unitAmount * platformFeePercent) / 100));
        if (feeAmount > 0) {
          body.set('payment_intent_data[transfer_data][destination]', destinationAccount);
          body.set('payment_intent_data[application_fee_amount]', String(feeAmount));
          body.set('metadata[destination_account]', destinationAccount);
          body.set('metadata[platform_fee_percent]', String(platformFeePercent));
        }
      }
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const result = await stripeResponse.json();
    if (!stripeResponse.ok) {
      const message = result?.error?.message || 'Stripe session creation failed.';
      await supabase.from('bookings').delete().eq('id', insertedBooking.id);
      return json({ error: message }, 400);
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ stripe_session_id: result.id })
      .eq('id', insertedBooking.id);

    if (updateError) {
      return json({ error: updateError.message }, 400);
    }

    return json({ url: result.url, sessionId: result.id });
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clampPercent(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 30;
  }
  return Math.max(0, Math.min(100, value));
}

async function fetchStripePrice(
  stripePriceId: string | undefined,
  stripeSecretKey: string
): Promise<{ unit_amount?: number } | null> {
  if (!stripePriceId) {
    return null;
  }

  const response = await fetch(`https://api.stripe.com/v1/prices/${stripePriceId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`
    }
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as { unit_amount?: number };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
