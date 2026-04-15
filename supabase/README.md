# Supabase Booking Backend

This folder powers class checkout + auto seat tracking for the Schedule page.

## What it includes

- SQL migrations for bookings/capacity
- Edge Function: `create-checkout-session`
- Edge Function: `event-booking-counts`
- Edge Function: `stripe-webhook`

## Required Supabase secrets

Set these in your Supabase project (`Project Settings -> Edge Functions -> Secrets`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SITE_URL` (example: `http://localhost:4200` for local)

## Deploy

```bash
supabase db push
supabase functions deploy create-checkout-session
supabase functions deploy event-booking-counts
supabase functions deploy stripe-webhook --no-verify-jwt
```

## Stripe webhook endpoint

Use this URL in Stripe Webhooks:

`https://<your-project-ref>.functions.supabase.co/stripe-webhook`

Events to send:

- `checkout.session.completed`
- `checkout.session.expired`

## Local dev note

When running locally, set `src/environments/environment.ts`:

- `booking.edgeFunctionsBaseUrl` (`https://<project-ref>.functions.supabase.co`)
