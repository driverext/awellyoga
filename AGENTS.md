# Working on A-WELL Yoga

Use the existing checkout. Cloud tasks are already isolated; create a worktree
only when the user requests one. Start with `git status --short` and preserve
unrelated changes. Keep work focused on the requested behavior.

## Agent coordination

The main session is the orchestrator. Handle small, single-file requests directly.
For substantial work, delegate only independent tasks to the relevant specialist:
`frontend`, `cms`, `backend`, `qa`, `reviewer`, or `deep_debug`.
Use at most two simultaneous workers and do not create nested agent teams.
Give each worker a short brief with its files, acceptance criteria, and relevant
context. Workers share the checkout: assign separate file ownership and preserve
each other's changes. Reuse their findings rather than repeating their research.
The orchestrator integrates changes and runs the final relevant checks once.
Use a reviewer for substantial behavior changes and booking/payment/auth changes;
use `deep_debug` only when complexity or a diagnosed failed approach warrants it.
The orchestrator handles release commands when the user requests a release.

Native role/model settings are in `.codex/config.toml` and `.codex/agents/`.
If the runtime does not expose these roles, use available sub-agent tools with
these responsibilities and the model choices in `docs/CODEX_AGENTS.md` when
supported. Otherwise follow the same workflow in the main session. Do not claim
that role files activated model routing without runtime evidence.

## Where to edit

| Request | Start here |
| --- | --- |
| Page text, layout, styling | `src/app/pages/<page>/` (HTML, CSS, TypeScript) |
| Header, navigation, footer | `src/app/app.component.*` |
| Routes or redirects | `src/app/app.routes.ts` |
| Global styles | `src/styles.css` |
| Studio contact information | `src/app/config/site-constants.ts` |
| Retreat descriptions and pricing | `src/app/services/retreats.service.ts` |
| Schedule and calendar behavior | `src/app/pages/schedule/` |
| CMS queries and content models | `src/app/services/cms/` |
| Sanity content schemas and editor UI | `sanity/awell-yoga/` |
| Booking API calls | `src/app/services/booking.service.ts` |
| Server-side bookings and payments | `supabase/functions/` |
| Database schema | `supabase/migrations/` |

The frontend is Angular 19 with standalone components. The active CMS workspace
is `sanity/awell-yoga`, not the top-level `sanity/` directory. Check the relevant
component and service before searching the whole repository. Exclude
`node_modules`, build outputs, lockfiles, and media from broad searches unless
they are relevant. Read deployment documentation only for deployment work.

## Dependencies and startup

Reuse installed dependencies when present. Install with `npm ci` from the repo
root; install Studio dependencies with `npm ci --prefix sanity/awell-yoga` only
when working on the CMS. Keep lockfiles unchanged unless updating dependencies
is part of the request. The prepared cloud environment uses Node 24 and npm 11.

- Frontend: `NG_CLI_ANALYTICS=false npm start` (port 4200).
- Studio: `CI=1 SANITY_CLI_TELEMETRY_DISABLED=1 npm run cms:dev` (port 3333).

Reuse a healthy existing server. Inspect its logs before restarting it, and stop
only processes you started. Use `http://localhost:4200` for internal browser
checks: the hosted backend allows that CORS origin. Cloud onboarding does not
support user-facing localhost preview links.

## Validate in proportion to the change

Run commands from the repository root. Do not install dependencies or build the
CMS for an unrelated frontend edit. Start with the affected existing tests; run
the full suite for shared behavior changes. Repeat a check only after a relevant
change or failure diagnosis.

- Relevant unit tests:
  `npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/pages/retreat-details/*.spec.ts'`
  (replace the include pattern with the affected component or service).
- Full frontend unit suite:
  `npm test -- --watch=false --browsers=ChromeHeadless`.
- Frontend production build: `NG_CLI_ANALYTICS=false npm run build`.
- CMS production build: `CI=1 SANITY_CLI_TELEMETRY_DISABLED=1 npm run cms:build`
  when CMS configuration or schemas change.

For text or style edits, inspect the changed page in the browser and run the
frontend production build. For behavioral changes, run relevant tests as well.
A zero-test run is not validation. Keep failures and skipped checks explicit.
Do not disable tests or weaken assertions to make a check pass.

In the prepared cloud environment, set
`CHROME_BIN=/workspace/.cloud-onboarding/awellyoga/chromium-headless` for Karma
when that helper exists. It configures the platform proxy and container browser
flags. Chromium also needs writable access to its existing trusted NSS database
(`/home/agent/.pki/nssdb` in this environment); request narrow filesystem access
if sandbox restrictions prevent HTTPS browser checks. Preserve TLS verification.
If available, `node /workspace/.cloud-onboarding/awellyoga/smoke.cjs` checks
frontend navigation and calendar controls against the running development app.
These helpers are outside the checkout and may not exist in another environment.

Production builds fetch Google Fonts. A blocked domain or missing browser is an
environment problem to diagnose, not a reason to change application code or
disable verification. Existing component-style budget and CommonJS warnings are
nonfatal unless the build exits with an error.

## Hosted services and releases

The default frontend uses production Sanity and Supabase. Builds and public
content reads require no secret variables. Avoid submitting real checkout,
reservation, inquiry, reset, or email forms as tests. Use mocks for unit tests;
read-only CMS queries and booking-count requests are suitable integration checks.

`vercel.json` builds with `npm run build` and serves `dist/yoga-app/browser`.
The documented Vercel production branch is `master`. Supabase functions,
database migrations, and Sanity Studio require separate deployments; a frontend
GitHub push does not deploy those services. Follow the user's release request
and explain any additional deployment needed for the actual change.
