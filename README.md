# Gamification Monorepo (PoC)

This is a **Proof of Concept** gamification app built with **Next.js (App Router)**, **PostgreSQL**, and **Turbo monorepo**. It demonstrates a **real-time leaderboard** with modern tooling.

## ✅ Implemented

- **Monorepo with Turbo** (`apps/web`)
- **Next.js** frontend with Tailwind (dark/light via CSS vars)
- **Postgres** DB (`leaderboard` table) + trigger (`LISTEN/NOTIFY`)
- **API routes**: `/api/leaderboard`, `/api/events` (SSE, Node runtime)
- **Realtime UI**: SSE stream updates instantly on DB changes
- **Zustand** for global state
- **Framer Motion** animations (slowed springs, staggered rows)
- **Zod** validation for payloads
- **OpenTelemetry** bootstrap (`otel.cjs`) + custom span around DB query

## 🚀 Demo Flow

1. Run `npm i && npm run dev`
2. Open `http://localhost:3000` → see leaderboard
3. Update DB in `psql` → page updates live (no refresh)

```sql
UPDATE leaderboard SET score = score + 1 WHERE name='Device B';

## ⚠️ Missing (because PoC)

No authentication/authorization (RBAC)

No rate limiting / CSRF / CORS hardening

Uses postgres superuser in dev (needs least-privilege in prod)

.env secrets are local only (should use secret manager in prod)

Error handling & structured logging are minimal

OTel traces only export to console (should send to OTLP collector in prod)

## 🎯 Next Steps

Swap SSE → Zero Sync for offline-first sync

Add Challenges + Rewards CRUD with Zod validation

Wire Vitest/Playwright tests

Harden security (auth, headers, rate limits)

CI/CD pipeline + OTel collector integration
