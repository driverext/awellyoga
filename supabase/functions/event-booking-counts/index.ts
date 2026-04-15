import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

interface CountsPayload {
  eventIds?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Missing Supabase environment variables.' }, 500);
    }

    const payload = (await req.json()) as CountsPayload;
    const eventIds = (payload.eventIds || []).filter(Boolean);
    if (!eventIds.length) {
      return json({ counts: {} });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin
      .from('bookings')
      .select('sanity_event_id, booking_status, reservation_expires_at')
      .in('sanity_event_id', eventIds)
      .in('booking_status', ['pending', 'paid']);

    if (error) {
      return json({ error: error.message }, 400);
    }

    const now = new Date();
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      const eventId = row.sanity_event_id;
      if (!eventId) {
        continue;
      }

      const isPaid = row.booking_status === 'paid';
      const isPendingActive =
        row.booking_status === 'pending' &&
        !!row.reservation_expires_at &&
        new Date(row.reservation_expires_at) > now;

      if (isPaid || isPendingActive) {
        counts[eventId] = (counts[eventId] || 0) + 1;
      }
    }

    return json({ counts });
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
