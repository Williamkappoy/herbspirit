# Kapibana's Tickets — Development Setup

## Stack
- **Next.js 14** (App Router) with TypeScript
- **Prisma ORM** + PostgreSQL 16
- **Tailwind CSS** — black/gold premium theme
- **JWT auth** with bcrypt (cookie-based sessions)
- **Multilingual** (FR/NL/EN) via cookie-based i18n system

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
App runs at http://localhost:3000

The `setup` service installs deps, pushes the Prisma schema, and seeds demo data before the `web` dev server starts.

## Demo Accounts
- **Admin:** admin@kapibana.be / admin123
- **Organizer:** contact@brussels-events.be / organizer123
- **Buyer:** buyer@demo.be / buyer123

## Commission Logic
- Default rate: 5% (env `COMMISSION_RATE`)
- Stored per-order in the `Commission` table (gross, commission, organizer amounts)
- Never derived from UI — always read from stored financial records

## Key Files
- `prisma/schema.prisma` — full database schema (14 entities)
- `prisma/seed.ts` — demo data (categories, organizers, events, tickets, sample order)
- `lib/auth.ts` — JWT auth helpers (hash, verify, getCurrentUser)
- `lib/i18n/` — translations (FR/NL/EN) + server/client providers
- `middleware.ts` — protects `/dashboard/*` routes
- `docker-compose.base44.yml` — dev stack (PostgreSQL + Next.js)

## Architecture Notes
- Server Components for SEO pages (homepage, events, event detail, agenda)
- Client Components for interactive elements (cart, checkout, forms, header)
- Cart stored in localStorage (CartProvider context)
- Payments simulated via Base44 Payments placeholder (real integration needs user credentials)
- Event creation is a 5-step wizard for organizers
- Admin moderation: events can be approved/rejected/suspended
