# Sanity Studio (Content Admin)

This folder contains the Sanity Studio used by non-technical editors.

## Local setup

1. Install studio dependencies:
   ```bash
   cd sanity
   npm install
   ```
2. Add environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`.
3. Start studio:
   ```bash
   npm run dev
   ```
4. Open the Studio URL shown in terminal (usually `http://localhost:3333/studio`).

## Deploy studio

```bash
cd sanity
npm run deploy
```

Sanity will prompt for the hosted studio path the first time.
