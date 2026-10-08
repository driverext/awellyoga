import { test, expect, Page } from '@playwright/test';
import { NEURONIDRA_EVENT as event } from '../shared/neuronidra-event';
const bridge = 'http://127.0.0.1:55434';
async function isolate(page: Page) {
  await page.route('**/*.functions.supabase.co/**', async (route) => {
    const req = route.request(); const endpoint = new URL(req.url()).pathname;
    const response = await fetch(`${bridge}${endpoint}`, { method: req.method(), headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:4200', ...(req.headers()['authorization'] ? { Authorization: req.headers()['authorization'] } : {}) }, body: req.postData() || undefined });
    await route.fulfill({ status: response.status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: await response.text() });
  });
  await page.route('**/*.api.sanity.io/**', route => route.fulfill({ json: { result: [] } }));
  await page.route('https://js.stripe.com/**', route => route.abort());
  await page.route('https://checkout.stripe.com/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Isolated mock Stripe checkout</h1>' }));
}
test.beforeEach(async ({ page }) => { await fetch(`${bridge}/__test/reset`, { method: 'POST' }); await isolate(page); });

test('mobile page preserves copy, SEO, side-by-side options and has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/neuronidra');
  await expect(page.getByText('12 of 12 spots left')).toBeVisible();
  await expect(page).toHaveTitle('NeuroNidra™ in Prishtina — Guided Deep Rest with Arieta Berisha Kirk');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'NeuroNidra™ by Arieta Berisha Kirk: a guided deep-rest practice for anxiety, grief and overthinking. Somatic, vagal, neural. Sessions in Prishtina.');
  const schema = JSON.parse(await page.locator('#jsonld-neuronidra-event').textContent() || '{}');
  expect(schema.maximumAttendeeCapacity).toBe(12); expect(schema.offers.priceCurrency).toBe('EUR');
  expect(schema.startDate).toBe('2026-10-15T18:00:00+02:00');
  await expect(page.getByRole('heading', { name: "A practice, not a one-time fix" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const buttons = await page.locator('.payment-options button').evaluateAll(items => items.map(item => ({ y: item.getBoundingClientRect().y, width: item.getBoundingClientRect().width })));
  expect(buttons[0].y).toBe(buttons[1].y); expect(buttons[0].width).toBeGreaterThan(100);
  expect(errors).toEqual([]);
  await page.screenshot({ path: '/tmp/neuronidra-mobile.png', fullPage: true });
});

test('cash UI saves booking, shows confirmation and decrements spots', async ({ page }) => {
  await page.goto('/neuronidra'); await expect(page.getByText('12 of 12 spots left')).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('mobile@example.test');
  await page.getByLabel('Name', { exact: false }).fill('Mobile Guest');
  await page.getByLabel('Phone', { exact: false }).fill('+38344123456');
  await page.getByRole('button', { name: 'Reserve now, pay in cash' }).click();
  await expect(page.locator('.booking-confidence')).toContainText('Please bring 30 € in cash. Doors open 17:45.');
  await expect(page.getByText('11 of 12 spots left')).toBeVisible();
  const rows = await (await fetch(`${bridge}/__test/bookings`)).json();
  expect(rows[0].payment_status).toBe('unpaid_cash'); expect(rows[0].stripe_customer_name).toBe('Mobile Guest');
});

test('card UI opens trusted mock checkout; signed mock webhook stores paid booking', async ({ page }) => {
  await page.goto('/neuronidra'); await expect(page.getByText('12 of 12 spots left')).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('browser-card@example.test');
  await page.getByRole('button', { name: 'Pay by card', exact: true }).click();
  await page.waitForURL('https://checkout.stripe.com/**');
  await expect(page.getByRole('heading', { name: 'Isolated mock Stripe checkout' })).toBeVisible();
  const response = await fetch(`${bridge}/__test/complete-checkout`, { method: 'POST' }); expect(response.ok).toBe(true);
  const rows = await (await fetch(`${bridge}/__test/bookings`)).json(); expect(rows[0].booking_status).toBe('paid');
});

test('full class disables both choices and stale thirteenth reservation is rejected', async ({ page }) => {
  for (let i = 0; i < 12; i++) {
    const response = await fetch(`${bridge}/cash-reservation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id, name: 'Capacity Guest', email: `capacity${i}@example.test`, phone: '+38344123456' }) });
    expect(response.ok).toBe(true);
  }
  await page.goto('/neuronidra'); await expect(page.getByText('0 of 12 spots left')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay by card', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Reserve now, pay in cash' })).toBeDisabled();
  const response = await fetch(`${bridge}/cash-reservation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id, name: 'Extra Guest', email: 'extra@example.test', phone: '+38344123456' }) }); expect(response.status).toBe(409);
});

test('new event appears on workshop cards and calendar with a link to both payment options', async ({ page }) => {
  await page.goto('/workshops'); const card = page.locator('.workshop-card').filter({ hasText: event.title });
  await expect(card).toBeVisible(); await expect(card.getByRole('link', { name: 'Book Special Event' })).toHaveAttribute('href', '/neuronidra');
  await page.goto('/schedule');
  // Schedule selects the first upcoming local event when the CMS is empty.
  await expect(page.getByText(event.title, { exact: true }).first()).toBeVisible();
  await expect(page.locator('.event-time').filter({ hasText: '18:00–20:00' })).toBeVisible();
  await page.getByRole('button', { name: 'Book', exact: true }).first().click();
  await page.waitForURL('**/neuronidra#booking');
});


test('cash is visibly unpaid in dashboard and attendance, with EUR amount and phone', async ({ page }) => {
  const response = await fetch(`${bridge}/cash-reservation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id, name: 'Dashboard Cash Guest', email: 'dashboard@example.test', phone: '+38344123456' }) });
  expect(response.ok).toBe(true);
  await page.addInitScript(() => sessionStorage.setItem('awell_dashboard_admin_auth_header', `Basic ${btoa('test:local-only')}`));
  await page.goto('/dashboard');
  const row = page.locator('tr').filter({ hasText: 'Dashboard Cash Guest' });
  await expect(row).toContainText('Unpaid — cash on arrival');
  await expect(row).toContainText('+38344123456');
  await expect(row).toContainText('€30.00');
  await page.getByRole('button', { name: /View.*Attendance|Attendance|View.*List|View.*Roster/i }).first().click();
  await expect(page.locator('.attendance-section').filter({ hasText: 'Unpaid — cash on arrival' })).toContainText('Dashboard Cash Guest');
});
