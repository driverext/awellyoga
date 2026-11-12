import { NEURONIDRA_NOVEMBER_17_EVENT as event } from '../shared/neuronidra-event.ts';
import { assert, request, reset, rows, sessions, mails, completeCheckout } from './neuronidra-test-harness.ts';

Deno.test('November 17 cash/card bookings retain correct winter time and share twelve spots', async () => {
  await reset();
  const cash = (email: string) => ({ eventId: event.id, name: 'Test Guest', email, phone: '+38344123456' });
  const card = (email: string) => ({ eventId: event.id, title: event.title, email });
  const reservation = await request('cash-reservation', cash('cash@example.test'));
  assert(reservation.ok, await reservation.text());
  const booking = (await rows())[0];
  assert(Date.parse(booking.event_start) === Date.parse('2026-11-17T17:00:00Z'), 'Wrong winter timezone');
  assert(booking.amount_total === 3000 && booking.payment_status === 'unpaid_cash', 'Cash terms changed');
  assert(mails.every(mail => String(mail.text).includes('Tuesday, 17 November 2026')), 'Cash confirmation date incorrect');
  for (let i = 0; i < 11; i++) {
    const response = await request('create-checkout-session', card(`card${i}@example.test`));
    assert(response.ok, await response.text());
  }
  assert(sessions[0].body.get('cancel_url')?.includes('/neuronidra-november-17#booking'), 'Wrong return route');
  const paid = await completeCheckout(sessions[0]); assert(paid.ok, await paid.text());
  assert(mails.slice(-3).every(mail => String(mail.text).includes('Tuesday, 17 November 2026')), 'Card confirmation date incorrect');
  for (const endpoint of ['cash-reservation', 'create-checkout-session']) {
    const response = await request(endpoint, endpoint === 'cash-reservation' ? cash('extra@example.test') : card('extra@example.test'));
    assert(response.status === 409, 'Thirteenth booking accepted'); await response.text();
  }
  assert((await rows()).length === 12, 'Capacity incorrect');
});
