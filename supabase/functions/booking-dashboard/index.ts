import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

type BookingRow = {
  id: string;
  sanity_event_id: string | null;
  event_title: string | null;
  event_start: string | null;
  stripe_customer_name: string | null;
  stripe_customer_email: string | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: string | null;
  booking_status: string | null;
  created_at: string | null;
};

type PrivateRequestRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  goal: string | null;
  availability: string | null;
  status: string | null;
  created_at: string | null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Missing Supabase environment variables.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: bookingData, error: bookingError } = await admin
      .from('bookings')
      .select(
        'id, sanity_event_id, event_title, event_start, stripe_customer_name, stripe_customer_email, amount_total, currency, payment_status, booking_status, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (bookingError) {
      return json({ error: bookingError.message }, 400);
    }

    const { data: privateRequests, error: privateError } = await admin
      .from('private_session_requests')
      .select('id, name, email, phone, goal, availability, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (privateError) {
      return json({ error: privateError.message }, 400);
    }

    const bookings = (bookingData || []) as BookingRow[];
    const paidBookings = bookings.filter((row) => row.booking_status === 'paid');
    const totalRevenueCents = paidBookings.reduce((sum, row) => sum + (row.amount_total || 0), 0);
    const currency = paidBookings.find((row) => !!row.currency)?.currency || 'usd';

    const eventTotals = new Map<string, { eventTitle: string; bookingsCount: number; revenueCents: number }>();
    for (const booking of paidBookings) {
      const key = booking.sanity_event_id || booking.event_title || 'unknown-event';
      const title = booking.event_title || 'Untitled Event';
      const current = eventTotals.get(key) || { eventTitle: title, bookingsCount: 0, revenueCents: 0 };
      current.bookingsCount += 1;
      current.revenueCents += booking.amount_total || 0;
      eventTotals.set(key, current);
    }

    const topEvents = [...eventTotals.values()]
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 10);

    const recentBookings = bookings.slice(0, 50).map((row) => ({
      id: row.id,
      eventTitle: row.event_title,
      eventStart: row.event_start,
      customerName: row.stripe_customer_name,
      customerEmail: row.stripe_customer_email,
      amountTotal: row.amount_total,
      currency: row.currency,
      paymentStatus: row.payment_status,
      bookingStatus: row.booking_status,
      createdAt: row.created_at
    }));

    const recentPrivateSessionRequests = ((privateRequests || []) as PrivateRequestRow[]).slice(0, 25);

    return json({
      overview: {
        totalBookings: bookings.length,
        paidBookings: paidBookings.length,
        pendingBookings: bookings.filter((row) => row.booking_status === 'pending').length,
        totalRevenueCents,
        currency
      },
      topEvents,
      recentBookings,
      privateSessionRequests: recentPrivateSessionRequests
    });
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
