import { assert, event, request, reset, rows, sessions, mails, completeCheckout, setFailures, dbInsert, dbUpdate, handlers } from './neuronidra-test-harness.ts';
const cash = (email = 'cash@example.test') => ({ eventId: event.id, name: 'Cash Guest', email, phone: '+38344123456' });
const card = (email = 'card@example.test') => ({ eventId: event.id, title: event.title, email, maxSpots: 100, unitAmountCents: 1, currency: 'usd', stripePriceId: 'tampered', startDate: '2027-01-01' });

Deno.test('NeuroNidra isolated booking integration', async (t) => {
  await t.step('cash stores unpaid reservation, contact, EUR amount and arrival-note emails', async () => {
    await reset(); const response = await request('cash-reservation', cash());
    assert(response.status === 200, await response.text());
    const bookings = await rows(); assert(bookings.length === 1, 'One cash booking expected');
    const booking = bookings[0];
    assert(booking.booking_status === 'reserved' && booking.payment_status === 'unpaid_cash', 'Cash must stay unpaid');
    assert(booking.amount_total === 3000 && booking.currency === 'eur' && booking.stripe_customer_whatsapp === '+38344123456', 'Cash amount/contact missing');
    assert(mails.length === 3, 'Customer, admin, and teacher confirmations expected');
    assert(mails.every((m) => String(m.text).includes('Please bring 30 € in cash. Doors open 17:45.')), 'Cash note missing');
    assert(mails.every((m) => String(m.html).includes('Unpaid — cash on arrival')), 'Cash HTML mislabeled');
    assert(!String(mails[0].text).includes('Paid:'), 'Cash must not claim paid');
    const duplicate = await request('cash-reservation', cash()); assert(duplicate.status === 409, 'Duplicate cash must not reserve a second seat'); await duplicate.text();
    assert((await rows()).length === 1, 'Duplicate seat created');
  });
  await t.step('card enforces canonical EUR price, creates hold, signed webhook confirms and emails', async () => {
    await reset(); const response = await request('create-checkout-session', card());
    assert(response.status === 200, await response.text());
    const session = sessions[0];
    assert(session.body.get('line_items[0][price_data][unit_amount]') === '3000', 'Tampered price accepted');
    assert(session.body.get('line_items[0][price_data][currency]') === 'eur', 'Incorrect currency');
    assert(!session.body.has('line_items[0][price]'), 'Untrusted Stripe price accepted');
    assert((await rows())[0].booking_status === 'pending', 'Checkout must hold a spot');
    assert(Number(session.body.get('expires_at')) > Date.now() / 1000 + 29 * 60, 'Stripe expiry must fit hold');
    const webhook = await completeCheckout(session); assert(webhook.ok, await webhook.text());
    assert((await rows())[0].booking_status === 'paid', 'Webhook did not confirm booking');
    assert(mails.length === 3 && mails.every((m) => String(m.text).includes('18:00–20:00 (Europe/Belgrade)')), 'Card confirmation/timezone missing');
    const duplicate = await completeCheckout(session); assert(duplicate.ok, 'Webhook retry rejected'); await duplicate.text();
    assert(mails.length === 3, 'Duplicate webhook sent duplicate emails');
  });
  await t.step('mixed card/cash capacity closes both paths after twelve', async () => {
    await reset();
    for (let i = 0; i < 6; i++) { const r = await request('cash-reservation', cash(`cash${i}@example.test`)); assert(r.ok, await r.text()); }
    for (let i = 0; i < 6; i++) { const r = await request('create-checkout-session', card(`card${i}@example.test`)); assert(r.ok, await r.text()); }
    const count = await request('event-booking-counts', { eventIds: [event.id] });
    assert((await count.json()).counts[event.id] === 12, 'Both methods must count');
    for (const endpoint of ['cash-reservation', 'create-checkout-session']) {
      const r = await request(endpoint, endpoint === 'cash-reservation' ? cash('extra@example.test') : card('extra@example.test'));
      assert(r.status === 409, `${endpoint} accepted thirteenth booking`); await r.text();
    }
    for (const session of [...sessions]) { const r = await completeCheckout(session); assert(r.ok, await r.text()); }
    assert((await rows()).length === 12, 'Confirmed bookings must remain capped');
  });
  await t.step('concurrent card/cash requests cannot oversell', async () => {
    await reset(); const responses = await Promise.all(Array.from({ length: 24 }, (_, i) => request(i % 2 ? 'cash-reservation' : 'create-checkout-session', i % 2 ? cash(`race${i}@example.test`) : card(`race${i}@example.test`))));
    const accepted = responses.filter((r) => r.ok).length;
    assert(accepted === 12, `Expected 12 concurrent admissions, got ${accepted}`);
    assert(responses.every((r) => r.ok || r.status === 409), 'Unexpected capacity failure response');
    await Promise.all(responses.map((r) => r.text()));
    assert((await rows()).length === 12, 'Concurrent overselling occurred');
  });
  await t.step('expired checkout releases seat; Stripe failure cleans up hold', async () => {
    await reset(); const r = await request('create-checkout-session', card()); assert(r.ok, await r.text());
    const expired = await completeCheckout(sessions[0], 'checkout.session.expired'); assert(expired.ok, await expired.text());
    const count = await request('event-booking-counts', { eventIds: [event.id] }); assert(!(await count.json()).counts[event.id], 'Expired hold counted');
    setFailures(true); const failure = await request('create-checkout-session', card('failure@example.test')); assert(failure.status === 400, 'Expected simulated Stripe failure'); await failure.text();
    assert((await rows()).length === 1, 'Stripe failure leaked a seat');
  });
  await t.step('invalid cash fields/event and invalid webhook signatures are rejected', async () => {
    await reset();
    for (const body of [{ ...cash(), phone: '' }, { ...cash(), phone: '-------' }, { ...cash(), email: 'bad' }, { ...cash(), eventId: 'another-event' }, { ...cash(), name: '' }]) {
      const r = await request('cash-reservation', body); assert(r.status === 400, 'Invalid reservation accepted'); await r.text();
    }
    const r = await request('stripe-webhook', { type: 'checkout.session.completed' }); assert(r.status === 400, 'Unsigned webhook accepted'); await r.text();
    assert((await rows()).length === 0, 'Invalid requests mutated bookings');
  });
  await t.step('database rejects stale hold reactivation at full capacity; other events unaffected', async () => {
    await reset();
    const stale = await dbInsert({ sanity_event_id: event.id, event_title: event.title, booking_status: 'pending', reservation_expires_at: '2026-01-01', payment_status: 'pending' }); assert(stale.ok, await stale.text());
    const staleId = (await rows())[0].id;
    for (let i = 0; i < 12; i++) { const r = await request('cash-reservation', cash(`full${i}@example.test`)); assert(r.ok, await r.text()); }
    const reactivated = await dbUpdate(staleId, { booking_status: 'paid', payment_status: 'paid', reservation_expires_at: null });
    assert(!reactivated.ok, 'Expired hold reactivation exceeded capacity'); await reactivated.text();
    const extra = await dbInsert({ sanity_event_id: event.id, event_title: event.title, booking_status: 'paid', payment_status: 'paid' }); assert(!extra.ok, 'Database allowed overcapacity'); await extra.text();
    const other = await dbInsert({ sanity_event_id: 'unrelated-event', event_title: 'Existing Class', booking_status: 'paid', payment_status: 'paid' }); assert(other.ok, await other.text());
  });
  await t.step('both booking methods close at the event start', async () => {
    await reset(); const originalNow = Date.now;
    Date.now = () => Date.parse(event.startDate) + 1;
    try {
      for (const endpoint of ['cash-reservation', 'create-checkout-session']) {
        const r = await request(endpoint, endpoint === 'cash-reservation' ? cash() : card());
        assert(r.status === 409, 'Booking accepted after event start'); await r.text();
      }
    } finally { Date.now = originalNow; }
    assert((await rows()).length === 0, 'Closed event created a booking');
  });
  await t.step('dashboard exposes cash contact and unpaid status without counting unpaid money as revenue', async () => {
    await reset(); const r = await request('cash-reservation', cash()); assert(r.ok, await r.text());
    const dashboard = await handlers['booking-dashboard'](new Request('http://localhost/booking-dashboard', { headers: { Authorization: `Basic ${btoa('test:local-only')}` } }));
    assert(dashboard.ok, 'Dashboard failed'); const data = await dashboard.json();
    assert(data.recentBookings[0].paymentStatus === 'unpaid_cash', 'Cash status missing');
    assert(data.recentBookings[0].customerWhatsApp === '+38344123456', 'Cash contact missing');
    assert(data.overview.totalRevenueCents === 0 && data.overview.paidBookings === 0, 'Unpaid cash treated as revenue');
  });
  await t.step('email failures preserve reservation and warn the client', async () => {
    await reset(); setFailures(false, true); const r = await request('cash-reservation', cash()); assert(r.ok, 'Email failure must not lose booking');
    assert((await r.json()).notificationWarning === true && (await rows()).length === 1, 'Email warning or saved booking missing');
  });
  await reset();
});
