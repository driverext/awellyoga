// Isolated handlers + real local PostgREST/Postgres, with Stripe/email intercepted.
// No request may leave localhost except dependency downloads performed by Deno.
import { NEURONIDRA_EVENT } from '../shared/neuronidra-event.ts';
export { NEURONIDRA_EVENT as event };
export function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
export const restUrl = 'http://127.0.0.1:55433';
const secret = 'neuronidra-isolated-tests-only-32-characters';
export const webhookSecret = 'whsec_isolated_test_only';
async function hmac(text: string, key: string): Promise<string> {
  const imported = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', imported, new TextEncoder().encode(text)));
  return Array.from(bytes, (b) => String.fromCharCode(b)).join('');
}
const b64 = (s: string) => btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const tokenText = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify({ role: 'service_role', exp: Math.floor(Date.now() / 1000) + 3600 }))}`;
const jwt = `${tokenText}.${b64(await hmac(tokenText, secret))}`;
for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE']) Deno.env.delete(name);
Deno.env.set('SUPABASE_URL', restUrl);
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', jwt);
Deno.env.set('STRIPE_SECRET_KEY', 'sk_test_isolated_mock_only');
Deno.env.set('STRIPE_WEBHOOK_SECRET', webhookSecret);
Deno.env.set('RESEND_API_KEY', 'test_mock_only');
Deno.env.set('BOOKING_EMAIL_FROM', 'test@example.test');
Deno.env.set('SITE_URL', 'http://localhost:4200');
Deno.env.set('DASHBOARD_USERNAME', 'test');
Deno.env.set('DASHBOARD_PASSWORD', 'local-only');
export const mails: Array<Record<string, unknown>> = [];
export const sessions: Array<{ id: string; body: URLSearchParams }> = [];
export let failStripe = false;
export let failEmail = false;
export function setFailures(stripe = false, email = false) { failStripe = stripe; failEmail = email; }
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith(`${restUrl}/rest/v1/`)) return originalFetch(url.replace('/rest/v1/', '/'), init);
  if (url.startsWith(restUrl)) return originalFetch(input, init);
  if (url === 'https://api.stripe.com/v1/checkout/sessions') {
    if (failStripe) return Response.json({ error: { message: 'Simulated Stripe failure' } }, { status: 400 });
    const id = `cs_test_mock_${sessions.length + 1}`;
    sessions.push({ id, body: new URLSearchParams(String(init?.body)) });
    return Response.json({ id, url: `https://checkout.stripe.com/c/pay/${id}` });
  }
  if (url === 'https://api.resend.com/emails') {
    mails.push(JSON.parse(String(init?.body)));
    return Response.json(failEmail ? { message: 'Simulated email failure' } : { id: 'mock-message' }, { status: failEmail ? 500 : 200 });
  }
  throw new Error(`Unexpected outbound request prevented: ${new URL(url).hostname}`);
};
type Handler = (req: Request) => Response | Promise<Response>;
export const handlers: Record<string, Handler> = {};
const originalServe = Deno.serve;
for (const endpoint of ['cash-reservation', 'create-checkout-session', 'event-booking-counts', 'stripe-webhook', 'booking-dashboard']) {
  // Capture the original production handler, with no external deployment.
  Deno.serve = ((handler: Handler) => { handlers[endpoint] = handler; }) as unknown as typeof Deno.serve;
  await import(`../supabase/functions/${endpoint}/index.ts`);
}
Deno.serve = originalServe;
export async function request(endpoint: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return await handlers[endpoint](new Request(`http://localhost/${endpoint}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:4200', ...headers }, body: JSON.stringify(body)
  }));
}
export async function reset() {
  const response = await originalFetch(`${restUrl}/bookings?id=not.is.null`, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt}` } });
  assert(response.ok, 'Could not reset the isolated database');
  await response.text();
  sessions.length = 0; mails.length = 0; setFailures();
}
export async function rows() {
  const response = await originalFetch(`${restUrl}/bookings?select=*`, { headers: { Authorization: `Bearer ${jwt}` } });
  assert(response.ok, 'Could not read isolated bookings');
  return await response.json();
}
export async function dbInsert(row: Record<string, unknown>) {
  return await originalFetch(`${restUrl}/bookings`, { method: 'POST', headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
}
export async function dbUpdate(id: string, patch: Record<string, unknown>) {
  return await originalFetch(`${restUrl}/bookings?id=eq.${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
}
export async function completeCheckout(session: typeof sessions[number], type = 'checkout.session.completed') {
  const metadata: Record<string, string> = {};
  for (const [key, value] of session.body) {
    const match = key.match(/^metadata\[(.+)\]$/); if (match) metadata[match[1]] = value;
  }
  const body = { id: `evt_mock_${session.id}_${type}`, type, data: { object: {
    id: session.id, metadata, client_reference_id: session.body.get('client_reference_id'),
    customer_details: { email: session.body.get('customer_email'), name: 'Card Guest', phone: '+38344123456' },
    payment_status: 'paid', amount_total: 3000, currency: 'eur', payment_intent: 'pi_mock_only'
  } } };
  const payload = JSON.stringify(body); const timestamp = Math.floor(Date.now() / 1000);
  const rawSignature = await hmac(`${timestamp}.${payload}`, webhookSecret);
  const signature = Array.from(rawSignature, (c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  return await handlers['stripe-webhook'](new Request('http://localhost/stripe-webhook', {
    method: 'POST', body: payload, headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` }
  }));
}
