# Deployment Notes

## Frontend (Vercel)

1. Connect this repository in Vercel.
2. Build command: `npm run build`
3. Output directory: `dist/yoga-app/browser`
4. Add environment variables in Vercel if needed for frontend runtime config.
5. Attach production domain (`awellyoga.com`) to the Vercel production environment.

## Sanity Studio

From project root:

```bash
npm run cms:build
npm run cms:deploy
```

## Supabase Edge Functions

Deploy from project root:

```bash
supabase functions deploy create-checkout-session --no-verify-jwt --use-api
supabase functions deploy event-booking-counts --no-verify-jwt --use-api
supabase functions deploy stripe-webhook --no-verify-jwt --use-api
supabase functions deploy private-session-request --no-verify-jwt --use-api
supabase functions deploy my-bookings --no-verify-jwt --use-api
supabase functions deploy booking-dashboard --no-verify-jwt --use-api
```

## Stripe Webhook

Configure webhook endpoint:

`https://<project-ref>.functions.supabase.co/stripe-webhook`

Events:

- `checkout.session.completed`
- `checkout.session.expired`

