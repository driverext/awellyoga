import { test, expect } from '@playwright/test';
import { NEURONIDRA_EVENTS } from '../shared/neuronidra-event';

test('both dates reuse the same mobile page and book the selected event', async ({ page }) => {
  const reservations: string[] = [];
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/*.api.sanity.io/**', route => route.fulfill({ json: { result: [] } }));
  await page.route('**/*.functions.supabase.co/**', route => {
    const endpoint = new URL(route.request().url()).pathname;
    if (endpoint === '/event-booking-counts') return route.fulfill({ json: { counts: {} } });
    if (endpoint === '/cash-reservation') {
      reservations.push(route.request().postDataJSON().eventId);
      return route.fulfill({ json: { bookingId: 'test-only-reference' } });
    }
    return route.abort();
  });
  for (const [index, event] of NEURONIDRA_EVENTS.entries()) {
    await page.goto(event.ctaUrl);
    await expect(page.locator('.page-header')).toContainText(index === 0 ? 'Thursday, 15 October 2026' : 'Saturday, 17 October 2026');
    const schema = JSON.parse(await page.locator('#jsonld-neuronidra-event').textContent() || '{}');
    expect(schema.startDate).toBe(event.startDate);
    expect(schema.url).toBe(`https://awellyoga.com${event.ctaUrl}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Pay by card', exact: true })).toBeEnabled();
    await page.getByLabel('Email', { exact: true }).fill('isolated@example.test');
    await page.getByLabel('Name', { exact: false }).fill('Isolated Guest');
    await page.getByLabel('Phone', { exact: false }).fill('+38344123456');
    await page.getByRole('button', { name: 'Reserve now, pay in cash' }).click();
    await expect(page.locator('.booking-confidence')).toContainText('Your spot is reserved.');
  }
  expect(reservations).toEqual(NEURONIDRA_EVENTS.map(event => event.id));
  await page.goto('/workshops');
  for (const event of NEURONIDRA_EVENTS) await expect(page.locator(`a[href="${event.ctaUrl}"]`)).toHaveCount(1);
});
