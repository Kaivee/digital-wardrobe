# Atelier — Digital Wardrobe

A single-user digital wardrobe built entirely on deterministic DBMS logic — no
AI, no ML, no auto-tagging. Every piece is added by hand with an explicit
form, costs are derived in TypeScript/SQL, laundry state flips on a simple
threshold rule, and outfit suggestions come from one pure SQL join scored
against a colour-harmony matrix.

Built with **Next.js 16 (App Router)**, **Prisma 7**, **MySQL/MariaDB**, and
the shadcn **Base Nova** design system. The UI is 2D, minimalist, and
responsive (Tailwind + shadcn/ui components).

## Features

- **Digital inventory grid** — manual form-based item entry with category /
  status / search filters and "Clean" vs. "In Laundry" status badges.
- **Cost-per-wear** — derived as `purchase_price / wear_count` in TypeScript;
  leaderboard of best-value pieces.
- **Laundry status trigger** — items flip to *In Laundry* once "wears since
  last wash" reaches their category's wear limit, then reset when marked clean.
- **Outfit recommender** — one deterministic SQL query cross-joins clean
  Topwear, Bottomwear, and Footwear inside the occasion's formality band and
  requires every colour pair to score ≥ 7 / 10 in the `ColorCompatibility`
  matrix. No randomness: the same wardrobe always yields the same outfits.
- **2D item photos** — upload your own image per item (optional), shown in the
  grid and detail view with a tinted icon fallback.

## Getting started

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL
npx prisma migrate dev      # creates tables
npx prisma db seed          # resets + loads demo wardrobe and colour matrix
npm run dev
```

Open http://localhost:3000. A demo account (`demo@atelier.local`) is created
on first request, so every page is instantly populated.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs typecheck) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx prisma db seed` | Reset demo data (`tsx prisma/seed.ts`) |
| `npx prisma migrate dev` | Apply schema migrations |

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL/MariaDB connection string (see `.env.example`) |

There are no AI keys. Nothing calls an external service at runtime except your
own database.

## Architecture notes

- `src/lib/recommender.ts` — the outfit engine. A single parameterised SQL
  statement filters CLEAN top/bottom/footwear into the occasion's formality
  band, cross-joins the slots, and inner-joins the `ColorCompatibility` matrix
  on `LEAST`/`GREATEST(color1, color2)` requiring a score ≥ 7 / 10.
- `src/lib/color-matrix.ts` — deterministic colour-harmony scoring (analogous,
  triadic, complementary) used to seed the matrix; identical input → identical
  score.
- `src/lib/cpw.ts` — `costPerWear = purchasePrice / max(wearCount, 1)`,
  derived on read so it can never drift from the source counters.
- `src/lib/laundry.ts` — transactional `logWearAndTrigger`: inserts the
  `WearLog`, bumps the counters, and flips status to `LAUNDRY` once the
  category wear limit is reached.
- `src/app/api/items` — manual `POST`/`PATCH` handlers for inventory CRUD;
  uploads land in `public/uploads` (gitignored).
- The demo user is resolved in `src/lib/user.ts` via `headers()`, which also
  opts every page into dynamic rendering (never prerendered against a cold DB).

## Deploying

The build is database-backed and all routes are dynamic. On Vercel (or any
Node host), set `DATABASE_URL`, run `npx prisma migrate deploy`, then
`npm run build`. The generated Prisma client (`src/generated/prisma`) is
excluded from git and regenerated at build time. User-uploaded photos are
written to the local filesystem, so prefer a self-hosted server or a
persistent volume for uploads.
