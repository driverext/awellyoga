import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

type StripeCustomer = {
  id: string;
};

type StripeSubscription = {
  id: string;
  status?: string;
  current_period_end?: number | null;
  cancel_at_period_end?: boolean | null;
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
      return json(req, { error: 'Membership status is not configured yet.' }, 500);
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
      return json(req, { error: 'You must be signed in.' }, 401);
    }

    const membership = await findActiveMembership(
      stripeSecretKey,
      membershipPriceId,
      user.email.trim().toLowerCase()
    );

    return json(req, {
      active: !!membership,
      status: membership?.status || null,
      renewsAt: membership?.renewsAt || null,
      cancelAtPeriodEnd: membership?.cancelAtPeriodEnd || false
    });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

async function findActiveMembership(
  stripeSecretKey: string,
  membershipPriceId: string,
  email: string
) {
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

    for (const subscription of subscriptions.data || []) {
      if (!['active', 'trialing'].includes(subscription.status || '')) {
        continue;
      }

      const hasMembershipPrice = (subscription.items?.data || []).some(
        (item) => item.price?.id === membershipPriceId
      );

      if (hasMembershipPrice) {
        return {
          status: subscription.status || 'active',
          renewsAt: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancelAtPeriodEnd: !!subscription.cancel_at_period_end
        };
      }
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

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json'
    }
  });
}
