# A-WELL Yoga Website

Production-focused Angular website for a yoga studio, with CMS-managed content, class booking workflows, and Stripe/Supabase backend integration.

## Highlights

- Angular 19 frontend with responsive pages and calendar-based scheduling UI
- Sanity Studio CMS for non-technical content editing
- Supabase Edge Functions for booking and dashboard APIs
- Stripe checkout integration for class booking payments
- Capacity tracking for events (paid + active pending reservations)
- Security hardening for dashboard access, CORS allowlists, and webhook validation

## Tech Stack

- Frontend: Angular, RxJS, TypeScript
- CMS: Sanity Studio (`sanity/awell-yoga`)
- Backend: Supabase (Postgres + Edge Functions)
- Payments: Stripe Checkout
- Deployment: Vercel (frontend), Sanity hosted studio, Supabase hosted functions

## Project Structure

```text
.
├── src/
│   ├── app/
│   │   ├── pages/                 # Route-level standalone components
│   │   ├── services/              # CMS + booking + payment services
│   │   ├── components/            # Shared UI blocks
│   │   └── guards/                # Route guards (dashboard auth flow)
│   └── environments/              # Angular env config
├── sanity/
│   └── awell-yoga/                # Canonical Sanity Studio project
├── supabase/
│   ├── functions/                 # Edge Functions (checkout, webhook, dashboard, etc.)
│   └── migrations/                # SQL migrations
└── vercel.json
```

## Core Routes

- `/home`
- `/about`
- `/offerings`
- `/schedule`
- `/ytt`
- `/workshops`
- `/retreats`
- `/recipes`
- `/blog`
- `/dashboard` (protected flow + backend auth)

Legacy routes:
- `/studio` redirects to `/schedule`
- `/shop` redirects to `/home`

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Run Angular app

```bash
npm start
```

App runs at `http://localhost:4200`.

### 3) Build

```bash
npm run build
```

## CMS (Sanity Studio)

Studio lives in `sanity/awell-yoga`.

```bash
npm run cms:install
npm run cms:dev
```

Use `.env` in `sanity/awell-yoga` with:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`

## Supabase Functions

Supabase functions and migrations are in `supabase/`.

Primary functions:

- `create-checkout-session`
- `event-booking-counts`
- `stripe-webhook`
- `private-session-request`
- `my-bookings`
- `booking-dashboard`

See [supabase/README.md](/Users/jacob/Projects/awellyoga/supabase/README.md) for deployment and secret requirements.

## NPM Scripts

- `npm start` – run Angular dev server
- `npm run build` – production build
- `npm run test` – unit tests
- `npm run cms:install` – install Sanity Studio deps
- `npm run cms:dev` – run Sanity Studio locally
- `npm run cms:build` – build Sanity Studio
- `npm run cms:deploy` – deploy Sanity Studio

## Deployment

See [docs/DEPLOYMENT.md](/Users/jacob/Projects/awellyoga/docs/DEPLOYMENT.md) for Vercel + Sanity + Supabase deployment steps.

## Security Notes

- Dashboard API now enforces backend authorization (not UI-only protection)
- CORS is restricted by allowlist via Supabase function secrets
- Stripe webhook verification includes timestamp tolerance and duplicate-event protection
- Keep all API keys/secrets in environment/secret managers, never in source files

## Portfolio Context

This repository demonstrates:

- Full-stack product thinking across frontend + CMS + backend + payments
- Migration from static content to editor-friendly headless CMS
- Practical operational features for a real service business
- Security remediation on active production workflows
