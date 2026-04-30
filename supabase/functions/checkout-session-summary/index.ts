import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

type StripeSession = {
  id: string;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string>;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  custom_fields?: Array<{
    key?: string;
    text?: { value?: string | null } | null;
  }> | null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) });
  }

  if (!isOriginAllowed(req)) {
    return json(req, { error: 'Origin not allowed.' }, 403);
  }

  try {
    if (req.method !== 'GET') {
      return json(req, { error: 'Method not allowed.' }, 405);
    }

    const url = new URL(req.url);
    const sessionId = (url.searchParams.get('session_id') || '').trim();
    if (!sessionId) {
      return json(req, { error: 'Missing session_id.' }, 400);
    }

    const stripeSecretKey = (Deno.env.get('STRIPE_SECRET_KEY') || '').trim();
    const supabaseUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
    const supabaseServiceRoleKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();
    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
      return json(req, { error: 'Missing environment variables.' }, 500);
    }

    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Stripe-Version': '2024-12-18.acacia'
      }
    });

    const session = (await stripeResponse.json()) as StripeSession & { error?: { message?: string } };
    if (!stripeResponse.ok) {
      return json(req, { error: session?.error?.message || 'Could not retrieve checkout session.' }, 400);
    }

    const bookingId = (session.metadata?.booking_id || '').trim();
    const whatsappFromSession =
      session.custom_fields?.find((field) => field.key === 'whatsapp')?.text?.value?.trim() || null;

    let bookingRow: Record<string, unknown> | null = null;
    if (bookingId) {
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      const { data } = await supabase
        .from('bookings')
        .select('id, stripe_customer_email, stripe_customer_name, stripe_customer_whatsapp, payment_status')
        .eq('id', bookingId)
        .maybeSingle();
      bookingRow = data as Record<string, unknown> | null;
    }

    return json(req, {
      sessionId: session.id,
      bookingId: bookingId || null,
      customerEmail:
        (bookingRow?.['stripe_customer_email'] as string | undefined) || session.customer_details?.email || null,
      customerName:
        (bookingRow?.['stripe_customer_name'] as string | undefined) || session.customer_details?.name || null,
      customerWhatsApp:
        (bookingRow?.['stripe_customer_whatsapp'] as string | undefined) || whatsappFromSession,
      eventId: session.metadata?.sanity_event_id || null,
      eventType: inferEventType(session.metadata?.event_type || session.metadata?.event_title || ''),
      eventTitle: session.metadata?.event_title || null,
      eventStart: session.metadata?.event_start || null,
      eventEnd: session.metadata?.event_end || null,
      eventDateLabel: session.metadata?.event_dates_label || null,
      eventLocation: session.metadata?.event_location || null,
      amountTotal: typeof session.amount_total === 'number' ? session.amount_total : null,
      currency: session.currency || null,
      paymentStatus: (bookingRow?.['payment_status'] as string | undefined) || session.payment_status || null
    });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...buildCorsHeaders(req)
    }
  });
}

function inferEventType(value: string): 'Retreat' | 'Workshop' | 'Yoga Class' {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('retreat')) {
    return 'Retreat';
  }
  if (normalized.includes('workshop')) {
    return 'Workshop';
  }
  return 'Yoga Class';
}
