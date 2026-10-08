// Local browser-test bridge. All handlers use the isolated database and mock providers.
import { handlers, reset, rows, completeCheckout, sessions } from './neuronidra-test-harness.ts';
Deno.serve({ hostname: '127.0.0.1', port: 55434 }, async (req) => {
  const path = new URL(req.url).pathname.slice(1);
  if (path === '__test/reset' && req.method === 'POST') { await reset(); return Response.json({ ok: true }); }
  if (path === '__test/bookings') return Response.json(await rows());
  if (path === '__test/complete-checkout' && req.method === 'POST') {
    const session = sessions.at(-1); if (!session) return Response.json({ error: 'No mock session' }, { status: 400 });
    return await completeCheckout(session);
  }
  if (!handlers[path]) return Response.json({ error: 'Unknown test endpoint' }, { status: 404 });
  return await handlers[path](req);
});
