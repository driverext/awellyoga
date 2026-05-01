# Supabase Booking Backend

This folder handles the live operational side of the site:

- checkout session creation
- booking persistence
- seat counting
- membership reservations
- webhook fulfillment
- internal dashboard data
- lead / inquiry capture for a few forms

## Main pieces

- SQL migrations
- `create-checkout-session`
- `checkout-session-summary`
- `event-booking-counts`
- `stripe-webhook`
- `private-session-request`
- `membership-checkout`
- `member-reservation`
- `booking-dashboard`
- `ytt-interest`
- `neuroyoga-interest`

## Required secrets

Set these in `Project Settings -> Edge Functions -> Secrets`.

Core:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`

Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Optional / feature-specific:

- `DASHBOARD_USERNAME`
- `DASHBOARD_PASSWORD`
- `BOOKING_NOTIFY_TO`
- `BOOKING_CLASS_LIST_URL`
- SMTP-related secrets if internal / customer emails are being sent from functions

## Deploy flow

Database:

```bash
supabase db push
```

Functions:

```bash
supabase functions deploy create-checkout-session --no-verify-jwt --use-api
supabase functions deploy checkout-session-summary --no-verify-jwt --use-api
supabase functions deploy event-booking-counts --no-verify-jwt --use-api
supabase functions deploy stripe-webhook --no-verify-jwt --use-api
supabase functions deploy private-session-request --no-verify-jwt --use-api
supabase functions deploy membership-checkout --no-verify-jwt --use-api
supabase functions deploy member-reservation --no-verify-jwt --use-api
supabase functions deploy booking-dashboard --no-verify-jwt --use-api
supabase functions deploy ytt-interest --no-verify-jwt --use-api
supabase functions deploy neuroyoga-interest --no-verify-jwt --use-api
```

## Stripe webhook endpoint

Use this URL in Stripe:

`https://<your-project-ref>.functions.supabase.co/stripe-webhook`

Current subscribed events:

- `checkout.session.completed`
- `checkout.session.expired`

## Local note

The frontend points at the hosted Supabase project by default. If that changes, update:

- `booking.edgeFunctionsBaseUrl` in the Angular environment config

That value is only the base function URL. Billing logic, seat checks, and fulfillment still live in the Edge Functions themselves.
