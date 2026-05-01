# Deployment Notes

This project deploys in three separate pieces:

1. Angular frontend on Vercel
2. Sanity Studio
3. Supabase functions / database changes

## Frontend (Vercel)

Recommended Vercel settings:

1. Connect the repo
2. Build command: `npm run build`
3. Output directory: `dist/yoga-app/browser`
4. Production domain: `awellyoga.com`

If a deploy looks odd, check these first:

- the latest commit actually reached `master`
- Vercel is building from the repo root
- no cached frontend page is hiding the new deploy

## Sanity Studio

From the repo root:

```bash
npm run cms:build
npm run cms:deploy
```

The active studio workspace is `sanity/awell-yoga`.

## Supabase database

When migrations change:

```bash
supabase db push
```

## Supabase Edge Functions

Deploy from the repo root. Most public-facing functions are intentionally deployed with `--no-verify-jwt` because the website calls them directly from the browser and they handle their own checks.

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

## Stripe webhook

Stripe webhook endpoint:

`https://<project-ref>.functions.supabase.co/stripe-webhook`

Current events in use:

- `checkout.session.completed`
- `checkout.session.expired`

If webhook deliveries start failing:

1. check the endpoint signing secret
2. check recent delivery logs in Stripe
3. confirm the function is actually deployed in Supabase
