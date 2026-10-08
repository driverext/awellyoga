import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { buildCorsHeaders, isOriginAllowed } from '../_shared/cors.ts';
import { isValidEmail } from '../_shared/email.ts';
import { sendBookingConfirmationEmail, sendInternalBookingAlert } from '../_shared/booking-emails.ts';
import { NEURONIDRA_EVENT, NEURONIDRA_DATE_LABEL } from '../../../shared/neuronidra-event.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: buildCorsHeaders(req) });
  if (!isOriginAllowed(req)) return json(req, { error: 'Origin not allowed.' }, 403);
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed.' }, 405);
  try {
    const payload = await req.json();
    if (!payload || typeof payload !== 'object') return json(req, { error: 'Invalid reservation.' }, 400);
    const event = NEURONIDRA_EVENT;
    if (payload.eventId !== event.id) return json(req, { error: 'Cash reservations are unavailable for this event.' }, 400);
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
    if (!name || name.length > 120 || email.length > 254 || !isValidEmail(email) || !/^[+\d\s().-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) {
      return json(req, { error: 'A name, valid email, and phone number are required.' }, 400);
    }
    if (Date.now() >= Date.parse(event.startDate)) return json(req, { error: 'Booking for this event has closed.' }, 409);
    const url = Deno.env.get('SUPABASE_URL') || '';
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!url || !key) return json(req, { error: 'Booking backend is not configured.' }, 500);
    const admin = createClient(url, key);
    const { data: booking, error } = await admin.from('bookings').insert({
      sanity_event_id: event.id, event_title: event.title, event_type: event.eventType,
      instructor_name: event.instructorName, event_start: event.startDate, event_end: event.endDate,
      event_location: event.location, stripe_customer_name: name, stripe_customer_email: email,
      stripe_customer_whatsapp: phone, amount_total: event.unitAmountCents, currency: event.currency,
      payment_status: 'unpaid_cash', booking_status: 'reserved', reservation_expires_at: null
    }).select('id').single();
    if (error || !booking?.id) {
      if (error?.message === 'ALREADY_RESERVED') {
        return json(req, { error: 'You already have a reservation for this event. Please contact us if you need help.' }, 409);
      }
      const full = error?.message === 'CLASS_FULL';
      return json(req, { error: full ? 'This class is full.' : 'Could not reserve your spot.', code: full ? 'CLASS_FULL' : 'RESERVATION_FAILED' }, full ? 409 : 400);
    }
    const emailPayload = {
      toEmail: email, customerName: name, customerBackupContact: phone,
      eventType: event.eventType, instructorName: event.instructorName, eventTitle: event.title,
      eventStart: event.startDate, eventEnd: event.endDate, eventDateLabel: NEURONIDRA_DATE_LABEL,
      eventLocation: event.location, amountTotal: event.unitAmountCents, currency: event.currency,
      cashOnArrival: true
    };
    let notificationWarning = false;
    // A notification failure must not cause the client to create a second reservation.
    for (const send of [
      () => sendBookingConfirmationEmail(emailPayload),
      () => sendInternalBookingAlert({ ...emailPayload, bookingId: booking.id })
    ]) {
      try { await send(); }
      catch (error) { notificationWarning = true; console.error('Cash reservation notification failed:', (error as Error).message); }
    }
    return json(req, { bookingId: booking.id, notificationWarning });
  } catch { return json(req, { error: 'Could not process your reservation.' }, 500); }
});

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...buildCorsHeaders(req), 'Content-Type': 'application/json' } });
}
