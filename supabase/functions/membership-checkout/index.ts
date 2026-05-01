import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

interface MembershipCheckoutPayload {
  plan?: 'intro' | 'standard';
  email?: string;
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
    if (!stripeSecretKey || !monthlyPriceId) {
      return json(req, { error: 'Membership checkout is not configured yet.' }, 500);
    }

    const payload = (await req.json()) as MembershipCheckoutPayload;
    const plan = payload.plan === 'intro' ? 'intro' : 'standard';
    const email = (payload.email || '').trim().toLowerCase();

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
    if (isValidEmail(email)) {
      body.set('customer_email', email);
    }

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
