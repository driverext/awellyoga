# A-WELL Yoga Website

Production site for A-WELL Yoga. The frontend is Angular, content is managed in Sanity, and booking/payment flows run through Supabase + Stripe.

## What lives here

- Marketing pages for classes, workshops, retreats, YTT, and studio information
- A schedule page with live booking / capacity tracking
- A lightweight internal dashboard for attendance and booking review
- A Sanity Studio workspace for day-to-day content editing
- Supabase Edge Functions for checkout, webhooks, reminders, memberships, and admin data

## Stack

- Frontend: Angular 19, RxJS, TypeScript
- CMS: Sanity Studio in `sanity/awell-yoga`
- Backend: Supabase (Postgres + Edge Functions)
- Payments: Stripe Checkout
- Hosting: Vercel for the app, Supabase for functions, Sanity-hosted studio

## Project structure

```text
.
├── src/
│   ├── app/
│   │   ├── components/            # Shared UI
│   │   ├── guards/                # Route guards / dashboard gate
│   │   ├── pages/                 # Route-level standalone components
│   │   └── services/              # CMS, booking, SEO, Stripe helpers
│   └── environments/              # Frontend runtime config
├── sanity/
│   └── awell-yoga/                # Sanity Studio workspace
├── supabase/
│   ├── functions/                 # Edge Functions used by the live site
│   └── migrations/                # Database schema changes
└── docs/
```

## Main routes

- `/home`
- `/about`
- `/offerings`
- `/schedule`
- `/workshops`
- `/retreats`
- `/ytt`
- `/recipes`
- `/blog`
- `/dashboard`
- `/payment-success`
- `/neuroyoga-program`

Legacy routes:
- `/studio` redirects to `/schedule`
- `/shop` redirects to `/home`

## Local setup

### Frontend

```bash
npm install
npm start
```

The app runs at `http://localhost:4200`.

Production build:

```bash
npm run build
```

### Sanity Studio

```bash
npm run cms:install
npm run cms:dev
```

Studio env values live in `sanity/awell-yoga/.env`:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `SANITY_STUDIO_PREVIEW_ORIGIN`

If someone on the content side is editing regularly, point them to [sanity/awell-yoga/EDITOR_GUIDE.md](/Users/jacob/Projects/awellyoga/sanity/awell-yoga/EDITOR_GUIDE.md).

## Supabase overview

Supabase functions and migrations live in `supabase/`.

Key functions in the current booking flow:

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

See [supabase/README.md](/Users/jacob/Projects/awellyoga/supabase/README.md) for secrets and deployment notes.

## Useful scripts

- `npm start` - run Angular locally
- `npm run build` - production frontend build
- `npm run test` - unit tests
- `npm run cms:install` - install Studio dependencies
- `npm run cms:dev` - run Sanity Studio locally
- `npm run cms:build` - build Sanity Studio
- `npm run cms:deploy` - deploy Sanity Studio

## Deployment notes

See [docs/DEPLOYMENT.md](/Users/jacob/Projects/awellyoga/docs/DEPLOYMENT.md).

In practice, the live stack is split like this:

- Vercel deploys the Angular frontend from `master`
- Supabase functions are deployed separately from the CLI
- Sanity Studio is deployed separately from `sanity/awell-yoga`

## Security notes

- Booking redirects are restricted to trusted destinations
- Dashboard access still uses a simple browser prompt, but real data access is enforced on the backend
- Stripe webhook verification is handled server-side
- CORS is managed in Supabase function config / secrets, not by the frontend

## A couple of maintenance notes

- Avoid committing random media and local CLI config files unless they are intentionally part of the site
- If booking behavior changes, check both the frontend service layer and the matching Supabase Edge Function
- Sanity preview / visual editing is optional; if it ever causes trouble, `src/main.ts` is the first place to look
