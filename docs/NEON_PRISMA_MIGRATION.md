# Neon + Prisma Migration Plan

**Date:** 2026-09-22 · **Branch:** `security-hardening-v1`

## Goal
Replace Supabase Postgres (PostgREST + RLS) as the database backend with **Neon PostgreSQL
accessed through Prisma**, while preserving the authorization/security model already built on
`security-hardening-v1`. Supabase Auth is a **separate, later decision** — see §Auth seam.

## Current → target

| Concern | Today (Supabase) | Target (Neon + Prisma) |
|---|---|---|
| Data access | Mobile → PostgREST (`supabase-js`) | Mobile → **backend API** → Prisma → Neon |
| Authorization | RLS policies (`user_id = auth.uid()`) | **Server-side** `where { user_id: userId }`, `userId` derived from auth, never from the client |
| Identity | Supabase Auth (`auth.uid()`) | Backend auth middleware (fail-closed seam; provider chosen later) |
| AI gateway | Supabase Edge Function `legal-advisor` | Backend endpoint (auth-gated) calling OpenRouter; DB-independent |
| Schema | 4 SQL migrations | `prisma/schema.prisma` + generated migration |

## Database dependencies being replaced

1. `chat_sessions` — CRUD, ownership `user_id`.
2. `chat_messages` — CRUD, ownership inherited via parent session.
3. `legal_escalation_requests` — insert (validates conversation ownership), select own; **no** client update/delete.
4. `privacy_consents` — select own; insert server-side (signup) only.
5. `legal_sources` — public read only when `verification_status = 'verified'`; no client writes.
6. `users` — profile; select/update own; no client delete.
7. Public reference tables — `constitution_chapters`, `constitution_sections`, `legal_templates`,
   `lawyers`, `legal_aid_centers`, `organizations` — public read only, no client writes.

## RLS → Prisma translation (the security spec)

- Every private-table query scopes by the **server-derived** `userId` (from `requireUser`).
- Cross-user access returns **404** (not 403), so record existence is not leaked — matching RLS
  "returns no rows".
- The client request body can **never** supply `user_id`/ownership; the server sets it.
- Escalation insert re-verifies the referenced conversation belongs to the caller.
- No update/delete endpoints exist for escalation requests or `privacy_consents` (as in RLS).

## Auth seam (separate decision)

`src/authz.ts` `requireUser` **fails closed**: it rejects everything unless `AUTH_MODE=dev` is set,
which is a local-testing-only override that trusts an `x-user-id` header. The real provider
(Custom JWT / Clerk / Auth0 / …) is chosen in the next phase and plugged in here without touching
the data layer.

## Manual steps (blocking — need you)

1. Create a Neon project + database.
2. Copy the connection string → `backend/.env` as `DATABASE_URL` (placeholder in `backend/.env.example`).
3. Then: `prisma migrate deploy` and `npm run test` to run the authorization regression suite.

## Out of scope this phase (later)

- Removing Supabase code (do only after Neon replacement is verified working).
- Wiring the real auth provider.
- Folding the AI (OpenRouter) call into the backend chat flow.
- Seeding the public reference data (constitution/lawyers/aid-centers/templates) into Neon.
