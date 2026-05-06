import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

interface MembershipCheckoutPayload {
  plan?: 'intro' | 'standard';
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

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const monthlyPriceId = Deno.env.get('MEMBERSHIP_MONTHLY_PRICE_ID') || '';
    const introCouponId = Deno.env.get('MEMBERSHIP_INTRO_COUPON_ID') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    if (!stripeSecretKey || !monthlyPriceId || !supabaseUrl || !supabaseAnonKey) {
      return json(req, { error: 'Membership checkout is not configured yet.' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return json(req, { error: 'Please sign in before starting a membership.' }, 401);
    }

    const payload = (await req.json()) as MembershipCheckoutPayload;
    const plan = payload.plan === 'intro' ? 'intro' : 'standard';
    const email = user.email.trim().toLowerCase();

    const origin = resolveRedirectOrigin(req);
    const successUrl = `${origin}/schedule?membership=success#membership-options`;
    const cancelUrl = `${origin}/schedule#membership-options`;

    const body = new URLSearchParams();
    body.set('mode', 'subscription');
    body.set('success_url', successUrl);
    body.set('cancel_url', cancelUrl);
    body.set('line_items[0][price]', monthlyPriceId);
    body.set('line_items[0][quantity]', '1');
    body.set('metadata[membership_plan]', plan);
    body.set('metadata[source]', 'schedule-membership');
    body.set('metadata[user_id]', user.id);
    body.set('customer_email', email);

    if (plan === 'intro') {
      if (!introCouponId) {
        return json(req, { error: 'The intro membership offer is not configured yet.' }, 500);
      }
      body.set('discounts[0][coupon]', introCouponId);
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
      return json(req, { error: result?.error?.message || 'Stripe session creation failed.' }, 400);
    }

    return json(req, { url: result.url, sessionId: result.id });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function resolveRedirectOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  if (origin.startsWith('http://localhost:')) {
    return origin;
  }

  if (/^https:\/\/(www\.)?awellyoga\.com$/i.test(origin)) {
    return origin;
  }

  if (/^https:\/\/awellyoga(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)) {
    return origin;
  }

  return 'https://awellyoga.com';
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
