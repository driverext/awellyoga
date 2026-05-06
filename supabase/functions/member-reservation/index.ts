import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';
import {
  buildWhenLabel,
  DEFAULT_STUDIO_TIMEZONE,
  escapeHtml,
  formatDateTime,
  getInternalRecipients,
  sendEmailViaConfiguredProvider
} from '../_shared/email.ts';

interface MemberReservationPayload {
  eventId?: string;
  title?: string;
  eventType?: string;
  instructorName?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  email?: string;
  maxSpots?: number;
}

type StripeCustomer = {
  id: string;
  email?: string | null;
  name?: string | null;
};

type StripeSubscription = {
  id: string;
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

    const payload = (await req.json()) as MemberReservationPayload;
    const eventId = (payload.eventId || '').trim();
    const title = (payload.title || '').trim();
    const eventType = (payload.eventType || 'Yoga Class').trim();
    const instructorName = (payload.instructorName || '').trim();
    const email = (payload.email || '').trim().toLowerCase();
    const maxSpots = Number(payload.maxSpots || 0);

    if (!eventId || !title) {
      return json(req, { error: 'Missing event id or title.' }, 400);
    }

    if (!isValidEmail(email)) {
      return json(req, { error: 'A valid email address is required.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const membershipPriceId = Deno.env.get('MEMBERSHIP_MONTHLY_PRICE_ID') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey || !membershipPriceId) {
      return json(req, { error: 'Membership booking is not configured yet.' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: existingBookings, error: existingError } = await supabase
      .from('bookings')
      .select('id, booking_status, reservation_expires_at')
      .eq('sanity_event_id', eventId)
      .eq('stripe_customer_email', email)
      .in('booking_status', ['pending', 'paid']);

    if (existingError) {
      return json(req, { error: existingError.message }, 400);
    }

    const now = new Date();
    const activeExisting = (existingBookings || []).find((booking) => {
      if (booking.booking_status === 'paid') {
        return true;
      }
      return (
        booking.booking_status === 'pending' &&
        !!booking.reservation_expires_at &&
        new Date(booking.reservation_expires_at) > now
      );
    });

    if (activeExisting) {
      return json(req, { ok: true, message: 'You already have a reservation for this class.' });
    }

    if (maxSpots > 0) {
      const { data: allBookings, error: countError } = await supabase
        .from('bookings')
        .select('id, booking_status, reservation_expires_at')
        .eq('sanity_event_id', eventId);

      if (countError) {
        return json(req, { error: countError.message }, 400);
      }

      const activeCount = (allBookings || []).filter((booking) => {
        if (booking.booking_status === 'paid') {
          return true;
        }

        return (
          booking.booking_status === 'pending' &&
          !!booking.reservation_expires_at &&
          new Date(booking.reservation_expires_at) > now
        );
      }).length;

      if (activeCount >= maxSpots) {
        return json(req, { error: 'This class is full.', code: 'CLASS_FULL' }, 409);
      }
    }

    const membership = await findActiveMembership(stripeSecretKey, membershipPriceId, email);
    if (!membership) {
      return json(
        req,
        { error: 'We could not find an active membership for that email. Start a membership first or use the drop-in checkout.' },
        404
      );
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      sanity_event_id: eventId,
      event_title: title,
      event_type: eventType,
      instructor_name: instructorName || null,
      event_start: payload.startDate || null,
      event_end: payload.endDate || null,
      event_location: payload.location || null,
      stripe_customer_name: membership.customerName || null,
      stripe_customer_email: email,
      stripe_session_id: `membership:${membership.subscriptionId}`,
      amount_total: 0,
      currency: 'usd',
      payment_status: 'paid',
      booking_status: 'paid',
      reservation_expires_at: null
    });

    if (insertError) {
      return json(req, { error: insertError.message }, 400);
    }

    try {
      await sendInternalBookingAlert({
        bookingId: `membership:${membership.subscriptionId}`,
        customerName: membership.customerName || 'Member',
        customerEmail: email,
        eventTitle: title,
        eventType,
        instructorName,
        eventStart: payload.startDate || null,
        eventEnd: payload.endDate || null,
        eventLocation: payload.location || null
      });
    } catch (error) {
      console.error('Membership internal booking alert failed:', (error as Error).message);
    }

    return json(req, {
      ok: true,
      message: `Your spot for ${title} is confirmed through your membership.`
    });
  } catch (error) {
    return json(req, { error: (error as Error).message || 'Unexpected server error.' }, 500);
  }
});

async function findActiveMembership(stripeSecretKey: string, membershipPriceId: string, email: string) {
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
          subscriptionId: subscription.id,
          customerName: customer.name || null
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

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || 'Stripe request failed.');
  }

  return json as T;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type InternalAlertPayload = {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  eventTitle: string;
  eventType: string;
  instructorName?: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  eventLocation: string | null;
};

async function sendInternalBookingAlert(payload: InternalAlertPayload): Promise<void> {
  const timezone = (Deno.env.get('BOOKING_EMAIL_TIMEZONE') || DEFAULT_STUDIO_TIMEZONE).trim();
  const recipients = getInternalRecipients(payload.instructorName, payload.eventType);
  if (!recipients.length) {
    return;
  }

  const startsAt = formatDateTime(payload.eventStart, timezone);
  const endsAt = formatDateTime(payload.eventEnd, timezone);
  const whenLabel = buildWhenLabel('', startsAt, endsAt);
  const location = payload.eventLocation?.trim() || 'A-WELL Yoga';
  const subject = `Class Booking: ${payload.eventTitle} (${payload.customerName})`;
  const text = [
    'Class booking confirmed through membership.',
    '',
    `Booking ID: ${payload.bookingId}`,
    `Customer: ${payload.customerName}`,
    `Customer Email: ${payload.customerEmail}`,
    `Event: ${payload.eventTitle}`,
    payload.instructorName ? `Teacher: ${payload.instructorName}` : null,
    whenLabel ? `When: ${whenLabel}` : null,
    `Location: ${location}`
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
      <h2 style="margin:0 0 12px;">Class Booking Confirmed</h2>
      <p style="margin:0 0 6px;"><strong>Booking ID:</strong> ${escapeHtml(payload.bookingId)}</p>
      <p style="margin:0 0 6px;"><strong>Customer:</strong> ${escapeHtml(payload.customerName)}</p>
      <p style="margin:0 0 6px;"><strong>Customer Email:</strong> ${escapeHtml(payload.customerEmail)}</p>
      <p style="margin:0 0 6px;"><strong>Event:</strong> ${escapeHtml(payload.eventTitle)}</p>
      ${payload.instructorName ? `<p style="margin:0 0 6px;"><strong>Teacher:</strong> ${escapeHtml(payload.instructorName)}</p>` : ''}
      ${whenLabel ? `<p style="margin:0 0 6px;"><strong>When:</strong> ${escapeHtml(whenLabel)}</p>` : ''}
      <p style="margin:0;"><strong>Location:</strong> ${escapeHtml(location)}</p>
    </div>
  `;

  for (const toEmail of recipients) {
    await sendEmailViaConfiguredProvider({
      toEmail,
      subject,
      text,
      html,
      replyTo: payload.customerEmail
    });
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
