# NeuroNidra implementation review

The real application uses the existing hosted Supabase and Stripe Checkout flow. All payment/email mocks, test credentials, and local database fixtures are confined to `tests/`; they are not imported by application source or included in the Angular build. No application dependencies or lockfiles were changed. Release status is reported separately; the Supabase prerequisites below must be completed for the full booking feature to operate.

## Event and page

`/neuronidra` presents the requested copy, teacher, Prishtina location, Thursday 15 October 2026, 18:00–20:00 Europe/Belgrade (`+02:00` on that date), €30 EUR, 12-person capacity, exact SEO title/description, and Event structured data. The existing workshop styles and payment-form styles are reused. A workshop card and a local special-event entry join the existing schedule data; the CMS content/order of other classes is preserved. Schedule booking leads to this page so both payment choices are available.

The original 1920×1080 JPEG artwork was downloaded from the provided Google Drive link and added unchanged at `src/app/assets/workshops/neuronidra.jpg`. The page and workshop card reference `/assets/workshops/neuronidra.jpg`. Both loaded successfully in the browser; at 375px mobile width the full artwork renders at 335×188 without horizontal overflow. The production build was rerun successfully with the asset included.

## Booking behavior

- Card: existing `create-checkout-session` → Stripe-hosted Checkout → signed `stripe-webhook` → existing booking/email flow. For this event only, the backend fixes the amount/currency/date/capacity instead of trusting client-supplied terms, restricts payment to card, and sets a 31-minute Stripe expiry backed by a 32-minute capacity hold.
- Cash: `cash-reservation` validates name/email/phone, writes the existing `bookings` table with `booking_status=reserved`, `payment_status=unpaid_cash`, amount 3000, currency EUR, and no Stripe session/expiry. The existing phone/backup-contact column stores the phone. It sends the same customer/admin/teacher confirmation templates with “Unpaid — cash on arrival” and “Please bring 30 € in cash. Doors open 17:45.” Duplicate reservations for the same email are rejected; notification failure leaves the booking intact and warns the client.
- Capacity: the new PostgreSQL trigger serializes admission using a transaction advisory lock on this event. Paid bookings, confirmed cash reservations, and unexpired checkout holds share the hard cap of 12. Both endpoints reject the thirteenth booking, including races. Expired checkout holds release their seats. New bookings close at the event start. Live counts include cash; the page polls counts and refuses to book when availability cannot be checked.
- Admin: cash rows and CSV exports carry the unpaid label, and attendance has a separate unpaid cash section. Existing paid revenue calculations exclude cash reservations. This change does not add a cash collection/refund/cancellation admin workflow.

## Deployment prerequisites — not executed

After review, apply `20261009000000_neuronidra_cash_capacity.sql` to the intended Supabase project **before enabling the updated booking functions**. Deploy `cash-reservation`, `create-checkout-session`, `event-booking-counts`, and `stripe-webhook` together with their shared modules. Publish the Angular changes through the normal Vercel workflow only after those backend pieces are ready. Vercel alone does not deploy Supabase functions or migrations.

Existing service-role, Stripe/webhook and email-provider secrets remain in Supabase; no new production secret names are required. Production email delivery and real Stripe test-mode checkout still require verification against an authorized staging project. Do not use live payment credentials for that check.

## Repeatable isolated tests

These tests require Docker, Deno 2, Node/npm dependencies, and Chromium. On this cloud machine Deno is at `/workspace/cloud-tools/node_modules/.bin/deno`; set `DENO_DIR=/workspace/.deno-cache` and `DENO_TLS_CA_STORE=system` if necessary. Chromium's container wrapper is `/workspace/cloud-setup/chromium-headless`.

From the repository root:

```bash
bash tests/setup-neuronidra-db.sh
deno test --no-config --node-modules-dir=none --no-lock \
  --allow-read=. --allow-env --allow-net=127.0.0.1:55433 \
  tests/neuronidra-booking.test.ts
```

The fixtures use dedicated local PostgreSQL/PostgREST containers with loopback ports 55432/55433, and only the required booking schema. Supabase-specific cron extensions are not installed in this fixture. The new capacity migration itself is applied unchanged. The test harness intercepts Stripe and email requests; any unexpected outbound request is rejected. Synthetic webhook events are HMAC-signed and exercise the real webhook handler.

For browser tests, start Angular and the isolated bridge in separate terminals:

```bash
NG_CLI_ANALYTICS=false npm start -- --host 127.0.0.1
deno run --no-config --node-modules-dir=none --no-lock \
  --allow-read=. --allow-env --allow-net=127.0.0.1:55433,127.0.0.1:55434 \
  tests/neuronidra-local-server.ts
CHROME_BIN=/workspace/cloud-setup/chromium-headless \
  npx --no-install playwright test --config tests/neuronidra.playwright.config.ts
```

Run integration and browser suites sequentially: they reset the same isolated test table. No browser test calls hosted booking functions or real Stripe checkout. The card landing page is a test fixture, so these checks are not proof of a completed payment in Stripe's test environment.

Cleanup after stopping the bridge:

```bash
docker rm -f awellyoga-neuronidra-test-rest awellyoga-neuronidra-test-db
docker network rm awellyoga-neuronidra-tests
```

## Validation results

- Angular production build: passed. Existing style-budget and CommonJS dependency warnings remain.
- Angular development build: passed.
- Deno type checks for the four affected Edge Functions: passed.
- Isolated backend integration: 10 steps passed with real PostgreSQL/PostgREST, production handlers, and test-only Stripe/email mocks. Includes 24 concurrent mixed booking attempts, with exactly 12 accepted.
- Browser checks: 6 passed, covering 375px mobile layout without horizontal overflow, exact SEO/Event data, card/cash UI, full capacity, workshop/calendar listing, and cash dashboard/attendance labels.
- Existing Angular unit suite: all 5 passed after fast-forwarding the checkout to upstream commit `01c4570`, which supplies the repository guidance and repairs the pre-existing tests. Those three upstream files are not authored changes in this implementation. The suite still logs a nonfatal Stripe.js load warning.
- Lint: no runnable lint script is configured. The Studio's existing ESLint configuration refers to packages that are absent from its lockfile/install; no new lint dependencies were added.
- Git whitespace validation: passed. Application dependency manifests and lockfiles are unchanged.
- Actual Stripe test-mode completion and actual email delivery remain unverified. No live payment, booking, email, deployment, or CMS mutation was performed.

## Files changed

| File | Change |
| --- | --- |
| `src/app/assets/workshops/neuronidra.jpg` | Original supplied artwork, added unchanged. |
| `shared/neuronidra-event.ts` | Canonical event identity, fixed terms, image path, and cash/date notes. |
| `src/app/pages/neuronidra/neuronidra.component.ts` | Real booking service integration, live availability, form validation, confirmation, SEO/Event schema. |
| `src/app/pages/neuronidra/neuronidra.component.html` | Exact requested content, event details, remaining spots, side-by-side card/cash choices. |
| `src/app/pages/neuronidra/neuronidra.component.css` | Small layout additions to reused workshop/payment styles and mobile sizing. |
| `src/app/app.routes.ts` | New `/neuronidra` route. |
| `src/app/pages/workshops/workshops.component.ts` | New card without changing existing workshop data/schema. |
| `src/app/pages/workshops/workshops.component.html` | Optional event-specific schedule link on the existing card. |
| `src/app/services/cms/sanity-content.service.ts` | Merge the local special event into upcoming CMS events without writing live CMS content. |
| `src/app/pages/schedule/schedule.component.ts` | Route this event's booking to its page; identify its fixed time-zone display. |
| `src/app/pages/schedule/schedule.component.html` | Display this event's 18:00–20:00 Belgrade time; preserve other events' time formatting. |
| `src/app/services/booking.service.ts` | Cash endpoint client, new booking source, optional strict availability checks. |
| `src/app/services/seo.service.ts` | Optional exact-title setting; other pages retain existing branded titles. |
| `src/app/pages/dashboard/dashboard.component.ts` | Cash attendance section and readable status in table/CSV exports. |
| `src/app/pages/dashboard/dashboard.component.html` | Cash filter, row label, unpaid attendance with contact and amount due. |
| `public/sitemap.xml` | New event page URL. |
| `supabase/config.toml` | Register public cash reservation Edge Function. |
| `supabase/functions/cash-reservation/index.ts` | Real unpaid reservation storage and existing confirmation/notification flow. |
| `supabase/functions/create-checkout-session/index.ts` | Fixed event terms, shared cash-aware count, matching checkout hold/expiry, capacity errors. |
| `supabase/functions/event-booking-counts/index.ts` | Count confirmed cash reservations alongside paid bookings/active holds. |
| `supabase/functions/stripe-webhook/index.ts` | Use extracted shared email senders and the event's Belgrade date label. |
| `supabase/functions/_shared/booking-emails.ts` | Extract existing confirmation/admin templates, add opt-in cash labels and event timezone. |
| `supabase/functions/_shared/email.ts` | Optional failure reporting for cash confirmations; existing callers keep their behavior. |
| `supabase/migrations/20261009000000_neuronidra_cash_capacity.sql` | Transaction-safe 12-person cap and duplicate cash/start-time checks for this event only. |
| `tests/setup-neuronidra-db.sh` | Reusable dedicated local PostgreSQL/PostgREST fixture. |
| `tests/neuronidra-test-harness.ts` | Real handler/database integration with test-only payment/email interception. |
| `tests/neuronidra-booking.test.ts` | Capacity, race, payment/webhook, validation, expiry, failure and dashboard integration checks. |
| `tests/neuronidra-local-server.ts` | Loopback bridge from browser tests to original handlers. |
| `tests/neuronidra.playwright.config.ts` | Chromium configuration for these browser tests only. |
| `tests/neuronidra.browser.spec.ts` | Mobile, SEO/schema, card/cash, full capacity, listing, and dashboard browser checks. |
| `docs/NEURONIDRA_REVIEW.md` | This review, test instructions, outstanding prerequisites, and complete file summary. |
