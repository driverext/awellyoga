import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';

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
    if (!supabaseUrl || !supabaseAnonKey) {
      return json(req, { error: 'Missing Supabase environment variables.' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return json(req, { error: 'You must be signed in.' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const limit = Number(body?.limit || 20);

    const { data, error } = await supabase
      .from('bookings')
      .select(
        'id,event_title,event_start,event_end,event_location,payment_status,amount_total,currency,created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(Number.isFinite(limit) ? Math.min(limit, 100) : 20);

    if (error) {
      return json(req, { error: error.message }, 400);
    }

    return json(
      req,
      (data || []).map((row) => ({
        id: row.id,
        eventTitle: row.event_title,
        eventStart: row.event_start,
        eventEnd: row.event_end,
        eventLocation: row.event_location,
        paymentStatus: row.payment_status,
        amountTotal: row.amount_total,
        currency: row.currency,
        createdAt: row.created_at
      }))
    );
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json'
    }
  });
}
