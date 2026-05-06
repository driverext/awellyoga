import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

type StripeCustomer = {
  id: string;
};

type StripeSubscription = {
  status?: string;
  items?: {
    data?: Array<{
      price?: {
        id?: string;
      };
    }>;
  };
};

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const membershipPriceId = Deno.env.get('MEMBERSHIP_MONTHLY_PRICE_ID') || '';

    if (!supabaseUrl || !supabaseAnonKey || !stripeSecretKey || !membershipPriceId) {
      return json(req, { error: 'Membership management is not configured yet.' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const {
      data: { user },
      error: userError
    } = await authClient.auth.getUser();

    if (userError || !user?.email) {
      return json(req, { error: 'Please sign in before managing your membership.' }, 401);
    }

    const customerId = await findMembershipCustomerId(
      stripeSecretKey,
      membershipPriceId,
      user.email.trim().toLowerCase()
    );

    if (!customerId) {
      return json(
        req,
        { error: 'We could not find an active membership for this account yet.' },
        404
      );
    }

    const origin = resolveRedirectOrigin(req);
    const body = new URLSearchParams();
    body.set('customer', customerId);
    body.set('return_url', `${origin}/schedule#membership-options`);

    const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2024-12-18.acacia'
      },
      body: body.toString()
    });

    const result = await portalResponse.json();
    if (!portalResponse.ok) {
      return json(req, { error: result?.error?.message || 'Could not open the Stripe customer portal.' }, 400);
    }

    return json(req, { url: result.url });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

async function findMembershipCustomerId(
  stripeSecretKey: string,
  membershipPriceId: string,
  email: string
): Promise<string | null> {
  const customers = await stripeGet<{ data?: StripeCustomer[] }>(
    `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=10`,
    stripeSecretKey
  );

  for (const customer of customers.data || []) {
    if (!customer.id) {
      continue;
    }

    const subscriptions = await stripeGet<{ data?: StripeSubscription[] }>(
      `https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(customer.id)}&status=all&limit=100`,
      stripeSecretKey
    );

    const hasActiveMembership = (subscriptions.data || []).some((subscription) => {
      if (!['active', 'trialing'].includes(subscription.status || '')) {
        return false;
      }

      return (subscription.items?.data || []).some((item) => item.price?.id === membershipPriceId);
    });

    if (hasActiveMembership) {
      return customer.id;
    }
  }

  return null;
}

async function stripeGet<T>(url: string, stripeSecretKey: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Stripe-Version': '2024-12-18.acacia'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Stripe request failed.');
  }

  return data as T;
}

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
