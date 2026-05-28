import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

interface CreateCheckoutPayload {
  eventId: string;
  title: string;
  eventType?: string;
  instructorName?: string;
  instructorStripeAccountId?: string;
  startDate?: string;
  endDate?: string;
  dateLabel?: string;
  location?: string;
  priceLabel?: string;
  stripePriceId?: string;
  bookingUrl?: string;
  platformFeePercent?: number;
  maxSpots?: number;
  unitAmountCents?: number;
  currency?: string;
  successPath?: string;
  cancelPath?: string;
  bookingSource?: string;
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) });
  }

  if (!isOriginAllowed(req)) {
    return json(req, { error: 'Origin not allowed.' }, 403);
  }

  try {
    if (req.method !== 'POST') {
      return json(req, { error: 'Method not allowed.' }, 405);
    }

    const payload = (await req.json()) as CreateCheckoutPayload;
    if (!payload?.eventId || !payload?.title) {
      return json(req, { error: 'Missing event id or title.' }, 400);
    }

    const email = (payload.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return json(req, { error: 'A valid email address is required.' }, 400);
    }

    const hasDynamicAmount = typeof payload.unitAmountCents === 'number' && payload.unitAmountCents > 0;
    const normalizedCurrency = (payload.currency || 'usd').trim().toLowerCase();
    const normalizedCategory = normalizeCategory(payload.eventType, payload.title);
    const eventSlug = buildEventSlug(payload.eventId, payload.title);
    const bookingSource = normalizeToken(payload.bookingSource || inferBookingSource(payload.cancelPath, normalizedCategory)) || 'schedule';
    const pricingType = payload.stripePriceId ? 'stripe_price' : 'dynamic_amount';
    const pricingTier = inferPricingTier(payload.title, payload.priceLabel, normalizedCategory);
    const retreatPartnerScope = normalizedCategory === 'retreat' ? 'arieta_melita' : '';

    if (!payload.stripePriceId && !hasDynamicAmount) {
      if (payload.bookingUrl) {
        return json(req, {
          fallbackUrl: payload.bookingUrl,
          message: 'This event uses a direct payment link fallback because no Stripe Price ID is set.'
        });
      }
      return json(req, {
        error: 'No Stripe Price ID or custom payment amount was configured for this booking.'
      }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey) {
      return json(req, { error: 'Missing Supabase or Stripe environment variables.' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const maxSpots = Number(payload.maxSpots || 0);
    if (maxSpots > 0) {
      const { data: existingBookings, error: countError } = await supabase
        .from('bookings')
        .select('id, booking_status, reservation_expires_at')
        .eq('sanity_event_id', payload.eventId);

      if (countError) {
        return json(req, { error: countError.message }, 400);
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
          req,
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
        event_type: payload.eventType || null,
        instructor_name: payload.instructorName || null,
        event_start: payload.startDate || null,
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
      return json(req, { error: insertError?.message || 'Could not reserve this class spot.' }, 400);
    }

    const origin = resolveRedirectOrigin(req);
    const successUrl = resolveRedirectUrl(origin, payload.successPath, `/payment-success?session_id={CHECKOUT_SESSION_ID}`);
    const cancelUrl = resolveRedirectUrl(origin, payload.cancelPath, '/schedule#calendar');

    const body = new URLSearchParams();
    body.set('mode', 'payment');
    body.set('success_url', successUrl);
    body.set('cancel_url', cancelUrl);
    body.set('customer_email', email);
    body.set('name_collection[individual][enabled]', 'true');
    body.set('name_collection[individual][optional]', 'false');
    body.set('phone_number_collection[enabled]', 'true');
    body.set('client_reference_id', insertedBooking.id);
    body.set('metadata[booking_id]', insertedBooking.id);
    body.set('metadata[sanity_event_id]', payload.eventId);
    body.set('metadata[event_title]', payload.title);
    body.set('metadata[event_type]', payload.eventType || '');
    body.set('metadata[instructor_name]', payload.instructorName || '');
    body.set('metadata[event_start]', payload.startDate || '');
    body.set('metadata[event_end]', payload.endDate || '');
    body.set('metadata[event_dates_label]', payload.dateLabel || '');
    body.set('metadata[event_location]', payload.location || '');
    body.set('metadata[price_label]', payload.priceLabel || '');
    body.set('metadata[max_spots]', maxSpots > 0 ? String(maxSpots) : '');
    body.set('metadata[category]', normalizedCategory);
    body.set('metadata[event_slug]', eventSlug);
    body.set('metadata[booking_source]', bookingSource);
    body.set('metadata[pricing_type]', pricingType);
    if (pricingTier) {
      body.set('metadata[pricing_tier]', pricingTier);
    }
    if (retreatPartnerScope) {
      body.set('metadata[retreat_partner_scope]', retreatPartnerScope);
    }

    if (payload.stripePriceId) {
      body.set('line_items[0][price]', payload.stripePriceId);
      body.set('line_items[0][quantity]', '1');
    } else if (hasDynamicAmount) {
      body.set('line_items[0][price_data][currency]', normalizedCurrency);
      body.set('line_items[0][price_data][unit_amount]', String(payload.unitAmountCents));
      body.set('line_items[0][price_data][product_data][name]', buildStripeLineItemName(payload.title, normalizedCategory));
      const lineItemDescription = buildStripeLineItemDescription(payload, pricingTier, bookingSource);
      if (lineItemDescription) {
        body.set('line_items[0][price_data][product_data][description]', lineItemDescription);
      }
      body.set('line_items[0][quantity]', '1');
    }

    const shouldAllowPromotionCodes =
      (payload.title || '').toLowerCase().includes('neuroyoga') ||
      (payload.eventId || '').toLowerCase().includes('neuroyoga');

    const isRetreatCheckout =
      (payload.eventType || '').toLowerCase().includes('retreat') ||
      (payload.title || '').toLowerCase().includes('retreat');

    if (isRetreatCheckout) {
      body.set('custom_fields[0][key]', 'whatsapp');
      body.set('custom_fields[0][label][type]', 'custom');
      body.set('custom_fields[0][label][custom]', 'WhatsApp (optional for retreat coordination)');
      body.set('custom_fields[0][type]', 'text');
      body.set('custom_fields[0][optional]', 'true');
    }

    if (shouldAllowPromotionCodes) {
      body.set('allow_promotion_codes', 'true');
    }

    const destinationAccount = (payload.instructorStripeAccountId || '').trim();
    const platformFeePercent = clampPercent(payload.platformFeePercent);
    if (payload.stripePriceId && destinationAccount.startsWith('acct_') && platformFeePercent > 0) {
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
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2024-12-18.acacia'
      },
      body: body.toString()
    });

    const result = await stripeResponse.json();
    if (!stripeResponse.ok) {
      const message = result?.error?.message || 'Stripe session creation failed.';
      await supabase.from('bookings').delete().eq('id', insertedBooking.id);
      return json(req, { error: message }, 400);
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ stripe_session_id: result.id })
      .eq('id', insertedBooking.id);

    if (updateError) {
      return json(req, { error: updateError.message }, 400);
    }

    return json(req, { url: result.url, sessionId: result.id });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCategory(eventType: string | undefined, title: string | undefined): 'retreat' | 'workshop' | 'class' | 'special_event' {
  const normalizedType = normalizeToken(eventType || '');
  const normalizedTitle = normalizeToken(title || '');

  if (normalizedType.includes('retreat') || normalizedTitle.includes('retreat')) {
    return 'retreat';
  }
  if (normalizedType.includes('workshop') || normalizedTitle.includes('workshop')) {
    return 'workshop';
  }
  if (normalizedType.includes('special_event') || normalizedTitle.includes('special_event')) {
    return 'special_event';
  }
  return 'class';
}

function buildEventSlug(eventId: string | undefined, title: string | undefined): string {
  return normalizeToken(eventId || '') || normalizeToken(title || '') || 'awell_event';
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');
}

function inferBookingSource(cancelPath: string | undefined, category: string): string {
  const normalizedPath = (cancelPath || '').toLowerCase();
  if (normalizedPath.includes('/retreat')) {
    return 'retreat_page';
  }
  if (normalizedPath.includes('beach-yoga-payment')) {
    return 'beach_payment_page';
  }
  if (category === 'retreat') {
    return 'retreat_page';
  }
  return 'schedule';
}

function inferPricingTier(title: string | undefined, priceLabel: string | undefined, category: string): string {
  const normalized = `${title || ''} ${priceLabel || ''}`.toLowerCase();

  if (normalized.includes('single occupancy') || normalized.includes('single room')) {
    return 'single_occupancy';
  }
  if (normalized.includes('shared occupancy') || normalized.includes('shared room') || normalized.includes('twin room')) {
    return 'shared_occupancy';
  }
  if (normalized.includes('private session')) {
    return 'private_session';
  }
  if (normalized.includes('drop in') || normalized.includes('$25')) {
    return 'drop_in';
  }
  if (category === 'retreat') {
    return 'retreat_booking';
  }

  return '';
}

function buildStripeLineItemName(title: string, category: string): string {
  if (category === 'retreat') {
    return title;
  }
  if (category === 'special_event') {
    return title;
  }
  return title;
}

function buildStripeLineItemDescription(
  payload: CreateCheckoutPayload,
  pricingTier: string,
  bookingSource: string
): string {
  const details = [
    payload.priceLabel?.trim() || '',
    payload.dateLabel?.trim() || '',
    payload.location?.trim() || '',
    pricingTier ? `tier:${pricingTier}` : '',
    bookingSource ? `source:${bookingSource}` : ''
  ].filter(Boolean);

  const description = details.join(' • ');
  return description.slice(0, 500);
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

function resolveRedirectOrigin(req: Request): string {
  const siteUrl = (Deno.env.get('SITE_URL') || 'http://localhost:4200').trim();
  const requestedOrigin = (req.headers.get('origin') || '').trim();
  if (!requestedOrigin) {
    return siteUrl;
  }

  const allowedOrigins = (Deno.env.get('ALLOWED_REDIRECT_ORIGINS') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const fallbackAllowed = [siteUrl, 'http://localhost:4200', 'https://awellyoga.com', 'https://www.awellyoga.com'];
  const fullAllowlist = allowedOrigins.length ? allowedOrigins : fallbackAllowed;

  return fullAllowlist.includes(requestedOrigin) ? requestedOrigin : siteUrl;
}

function resolveRedirectUrl(origin: string, candidatePath: string | undefined, fallbackPath: string): string {
  const raw = (candidatePath || '').trim();
  if (!raw) {
    return `${origin}${fallbackPath}`;
  }

  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) {
      return `${origin}${fallbackPath}`;
    }
    return url.toString();
  } catch {
    return `${origin}${fallbackPath}`;
  }
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
