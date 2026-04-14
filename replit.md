# The Patieaux Business Directory

A curated business directory for The Patieaux Chick community. Users can browse, filter, and explore featured vendors, with business owners able to apply via a custom built-in form.

## Architecture

- **Frontend**: React 18 + Vite + TypeScript, styled with Tailwind CSS and Shadcn UI (Radix UI)
- **Backend**: Express server (`server/index.ts`) running on port 3001
- **Database**: Airtable only — all data lives in Airtable (listings + submissions)
- **Routing**: React Router DOM v6
- **Data fetching**: TanStack Query (React Query)

## Dev Setup

- `npm run dev` — starts both Vite (port 5000) and the Express API server (port 3001) concurrently
- Vite proxies all `/api/*` requests to the Express server

## Key Files

- `server/index.ts` — Express API server with two routes:
  - `GET /api/listings` — proxies Airtable API, returns Active listings
  - `POST /api/submit-listing` — submits a new business to Airtable with Status "Pending", then redirects user to payment link
- `src/lib/airtable.ts` — fetches listings from `/api/listings`, parses Airtable records into typed `Listing` objects
- `src/pages/Index.tsx` — main directory page with search, category, and location filters
- `src/pages/SubmitBusiness.tsx` — custom form matching the original design; submits to Airtable and redirects to http://bit.ly/thepatieauxbusinessguide on success

## Required Secrets

- `AIRTABLE_API_KEY` — Airtable personal access token
- `AIRTABLE_BASE_ID` — Airtable base ID (starts with `app…`)
- `AIRTABLE_TABLE_ID` — Airtable table ID or name for listings

## Deployment

- Build: `npm run build` (Vite only)
- Start: `tsx server/index.ts`
