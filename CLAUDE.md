# My Rights — Repository Knowledge Base

> **Status (2026-09-22):** Architecture mapped; **working branch = `security-hardening-v1`**
> (tip `8d3ba07`, the most recent branch — the user's last changes). **No fixes applied yet.**
> This file is the persistent memory for the My Rights project. Audit baseline: branch `main` @ `6e4daea`.

## 1. What this repo is

**My Rights** — a Nigerian legal-rights assistant (AI chat, document review/generation,
legal-aid map, human-lawyer escalation). Stores legal-rights **case data** for users, so
privacy/data-protection are launch blockers, not polish.

Monorepo with two apps and **no backend in-repo**:

```
My-Rights-frontend-mobil-web/
├── mobile/     # React Native Expo app (the APK target)
├── frontend/   # Next.js marketing + demo site (web)
└── docs/       # Security docs (threat model, remediation record, etc.)
```

The **backend is external** and split across two systems (see §5).

## 2. Branch topology (READ FIRST — this is the core risk)

Merge base of all three branches is `8a94847` ("fix Legal Aid Map crash on APK").

| Branch | State | What it contains |
|---|---|---|
| `main` (checked out) | = base + **5 documentation-only commits** | Insecure baseline code + docs *claiming* remediation |
| `origin/security-hardening-v1` | = base + ~150 real security commits + CI work | The **actual fixes** — **NOT merged to main** |
| `origin/stitch-supabase-redesign` | = base + 2 commits | Pending Supabase migration (started, incomplete) |

**The single most important fact:** the prior security audit's fixes were *implemented* on
`security-hardening-v1` (real code — edge function, RLS migrations, security services, CI),
but were **never merged to `main`**, never verified by CI (runner capacity was unavailable),
and **never deployed** (RLS migration not applied to live Supabase; edge function not
confirmed live). `main` — the branch any APK/website would build from — has **none** of the
fixes, and only has the *documentation* that says they were done.

Files only on `security-hardening-v1` (the fixes): `supabase/functions/legal-advisor/`,
`supabase/migrations/*.sql` (4 files), `mobile/src/services/{documentSecurity,legalService,localData}.service.ts`,
`mobile/scripts/{release-integrity,security-regression}.mjs`, `.github/workflows/security-hardening-mobile.yml`,
`mobile/.env.example`, `mobile/.npmrc`, `docs/TASK-*.md`, `docs/PRIVACY_*.md`.

Files only on `main` (the insecure artifacts): `mobile/.env` (tracked secret), `mobile/app.json`,
`mobile/config.json`, `mobile/src/services/api.ts` (legacy client), and the 5 summary docs.

## 3. Tech stack

- **mobile:** Expo SDK `~54.0.30`, React Native `0.81.5`, React `19.1.0`, TypeScript `~5.9.2`,
  React Navigation 7 (native-stack + bottom-tabs — **not** Expo Router),
  `@supabase/supabase-js` `^2.91.1`, `axios` `^1.13.2`, `expo-secure-store`, `expo-auth-session`,
  `expo-web-browser`, `react-native-maps` `1.20.1`, `react-native-document-scanner-plugin` `^2.0.4`.
- **frontend:** Next.js `16.0.7`, React `19.2.0`, Tailwind 4, `axios`, framer-motion, lucide-react.
- **State mgmt (mobile):** React Context only (`AuthContext`, `ThemeContext`, `JobContext`) +
  `AsyncStorage` / `expo-secure-store`. No Redux/Zustand.

## 4. Authentication flow (on `main` — what actually runs)

Auth is a **fractured hybrid** between two identity systems:

1. **Email/password signup & login** → custom Railway backend via `authService` (`/api/v1/auth/*`),
   returns JWT access/refresh tokens → stored in **SecureStore**.
2. **Google OAuth** → Supabase `auth.signInWithOAuth` + `WebBrowser.openAuthSessionAsync` +
   `setSession`/`exchangeCodeForSession` → tokens written to the **same SecureStore keys**.
3. **Password reset** → Supabase (`resetPasswordForEmail`, `updateUser`).
4. **Guest mode** → `AsyncStorage` `IS_GUEST` flag (no account).

Flow: `App.tsx` → `RootNavigator` (Onboarding → Auth if no session → Chat/Tools/Profile).
Onboarding and guest flags live in AsyncStorage. `onAuthStateChange` listener mirrors Supabase
session tokens into SecureStore `ACCESS_TOKEN`/`REFRESH_TOKEN` keys shared with the Railway path.

**Implication:** an email/password user (Railway JWT) and a Google user (Supabase JWT) are not the
same identity; the two systems do not reconcile, and both write to the same token keys.

## 5. Data layer / DB access (on `main`)

- **All chat, documents, escalation, transcription** → Railway REST backend via axios `api.ts`
  (`/api/v1/chat/*`, `/api/v1/chat/documents/*`). The backend schema is **not in this repo** and is
  unauditable from here.
- **Supabase** is used on `main` only for Google OAuth + password reset — **not** for data.
- The intended hardened architecture (on `security-hardening-v1`) is: Supabase Auth → Postgres/Storage
  behind **RLS** → authenticated `legal-advisor` Edge Function → OpenRouter. Schema defined in
  `supabase/migrations/` (tables: `users`, `chat_sessions`, `chat_messages`, `legal_escalation_requests`,
  privacy consent register, legal source registry). RLS policies anchor ownership to `auth.uid()`.

## 6. Environment variables / secrets

**Tracked in git on `main` (leaked):** `mobile/.env` contains
`PUBLIC_SUPABASE_URL=https://fdjltnfkmskeqtiaqlou.supabase.co`,
`PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…` (publishable key), `PROD_API_URL` (Railway),
`DEV_API_URL` (http LAN IP). `.env` is in `.gitignore` but was already committed → still tracked.

**Hardcoded in code:**
- `mobile/src/constants/config.ts`: `PROD_URL = https://injustice-production-be94.up.railway.app`,
  `LOCAL_IP = 192.168.0.138`, `USE_PRODUCTION_IN_DEV = true`.
- `mobile/app.config.ts`: defaults `dev/prod → https://injustice-production.up.railway.app/`,
  `staging → https://staging-api.myrights.ng`; EAS `projectId: 4cd8d457-fde8-43c2-bab7-b8a31df28fd4`.
- `frontend/src/lib/api.ts`: fallback `https://injustice-production.up.railway.app/`.

**Two different Railway subdomains** (`…up.railway.app` vs `…-be94.up.railway.app`) exist → config drift.

**Verified clean in git history:** no `service_role` / `sb_secret` / `SUPABASE_SERVICE` key, no raw
OpenRouter key (it's `Deno.env.get('OPENROUTER_API_KEY')` server-side on the branch), no `api_key=`
hardcoded. The anon key is *publishable* by design but is only safe if RLS is deployed (it is not).

## 7. Unresolved-risk list (prior audit → verification status)

Source: `docs/BEFORE_AFTER_REMEDIATION.md` (baseline `ab1e62a` on `stitch-supabase-redesign`).
**Every** one of its 25 areas is marked *"Verification: Deferred"* in the doc itself.

| # | Risk | Fix present? | On which branch | Deployed? |
|---|---|---|---|---|
| 1 | Legacy/duplicate config + Railway release path | ✅ | `security-hardening-v1` | ❌ |
| 2 | AI gateway: client-controlled roles/provider/jurisdiction | ✅ edge fn | `security-hardening-v1` | ❌ |
| 3 | Missing RLS / IDOR cross-account access | ✅ migration | `security-hardening-v1` | ❌ (not applied to live Supabase) |
| 4 | Overstated privacy claims ("Zero-Trace", "AI verified") | ✅ | `security-hardening-v1` | ❌ |
| 5 | Local chat cache / cross-account isolation | ✅ | `security-hardening-v1` | ❌ (main still caches in AsyncStorage) |
| 6–11 | Legal positioning, lawyer directory, document/malicious-file, citations, jurisdiction, consent | ✅ | `security-hardening-v1` | ❌ |
| 12 | Auth hardened / Supabase source of truth / SecureStore | ✅ | `security-hardening-v1` | ❌ |
| 13–17 | Document generator, risk-score removal, build/release, chat persistence, fail-closed errors | ✅ | `security-hardening-v1` | ❌ |
| 18–20 | Logging redaction, secrets removal, dependency/supply-chain | ✅ | `security-hardening-v1` | ❌ (main still tracks `.env`, still has `axios`) |
| 21 | SecureStore, cleartext-off, permissions | ✅ | `security-hardening-v1` | ❌ |
| 22 | Escalation RLS + authenticated submission | ✅ | `security-hardening-v1` | ❌ |
| 23–25 | Regression suite, threat model, governance | ✅ (partly docs on main) | mixed | ❌ |

**Net:** fixes are *present in code* but only on an unmerged branch, unverified, undeployed.

## 8. Open decisions (do NOT act on these yet)

1. **Which branch to build the APK from** — `main` (builds today but insecure) vs
   `security-hardening-v1` (secure but unmerged, unverified, may not build clean).
2. **Pending Supabase migration** — `stitch-supabase-redesign` is the intended target architecture;
   not decided whether to fully migrate off the Railway backend.
3. **RLS + edge function deployment** to the live Supabase project (`fdjltnfkmskeqtiaqlou`) — not done.
4. **Railway backend fate** — external service; schema/security unknown and out of this repo.

## 8b. Verification results (run locally on `security-hardening-v1`, 2026-09-22)

`npm ci` (723 pkgs) then the branch's own gates:

| Gate | Command | Result |
|---|---|---|
| Security regression | `npm run test:security` | ✅ 20/20 PASS |
| Release integrity | `npm run verify:release` | ✅ PASS |
| Legacy-reference scan | `git grep` (CI step 8) | ✅ clean |
| Forbidden files | `.env`/`api.ts`/`app.json`/`supabaseClient.ts` | ✅ all absent |
| TypeScript | `npm run typecheck` | ✅ exit 0 |
| Expo Doctor | `npm run doctor` | ✅ 17/17 |
| Dependency audit | `npm audit --audit-level=high` | ❌ **FAILS** |

**Only failing gate:** `npm audit` → 38 vulns (1 critical `shell-quote` ≤1.8.4; 20 high — `ws`,
`nanoid`, `minimatch`, `picomatch`, `postcss`, `browserslist`, `js-yaml`, `lodash`, `markdown-it`,
`xmldom`, etc.). Almost all are **Metro/Expo build-tooling transitive deps**, not app code; `ws`
also appears via `@supabase/realtime-js`. The branch's last commits (Expo SDK 54 alignment,
lockfile sync) were aimed at this gate but did not fully green it.

**Scratch artifacts committed to the branch (should be removed before release):**
`mobile/ts_errors.txt` (16KB), `mobile/clean_errors.txt`, `mobile/test_edge.mjs`,
`mobile/test_payload.json`, `mobile/temp_onboarding.html`, `mobile/bugui/*.mp4`.

## 9. Conventions & notes

- Mobile screens live in `mobile/src/screens/{auth,main,profile,common}/`; services in
  `mobile/src/services/`; navigation in `mobile/src/navigation/`; contexts in `mobile/src/contexts/`.
- Logging goes through `mobile/src/utils/logger.ts` (redacts sensitive keys, `__DEV__`-gated);
  `App.tsx` also mutes all `console.*` in production.
- `react-native-document-scanner-plugin` requires a **native/dev build** — not available in Expo Go
  (see `mobile/.agent/workflows/native_build_transition.md`).
- EAS build profiles (from `mobile/eas.json`): `preview` → `apk`, `production` → `app-bundle`,
  `apk` profile → `apk` (extends production).
- Author: Tochukwu Praize Chimezie (academic project — see `mobile/example.md`).

## 10. Neon + Prisma migration (DB LIVE + verified — branch `security-hardening-v1`)

**Status (2026-09-22):** Neon project `autumn-mode-35762231` ("my rights") linked; `prisma migrate deploy`
applied the full schema; **5/5 authorization/isolation tests pass against live Neon**. `backend/.env`
holds `DATABASE_URL` (direct/unpooled) + `AUTH_MODE=dev`; `src/db.ts` loads it via `dotenv/config`.
Supabase code is **not removed yet** (per plan — remove only after the backend is fully wired).

Migrating the data layer from Supabase Postgres to **Neon PostgreSQL + Prisma**, preserving the
RLS security model as server-side authorization. Plan: `docs/NEON_PRISMA_MIGRATION.md`.

- New `backend/` (Node + Express + Prisma `5.22.0`): `src/db.ts`, `src/authz.ts` (fail-closed
  `requireUser` seam — real auth is a **later** decision), `src/services/{chat,escalation,legal,profile}.ts`
  (ownership enforced via `where { user_id: userId }`, cross-user access → 404), `src/routes.ts`, `src/index.ts`.
- `backend/prisma/schema.prisma` = full data model (users, chat_sessions, chat_messages,
  legal_escalation_requests, privacy_consents, legal_sources, + public reference tables).
- `backend/prisma/migrations/20260922000000_init/migration.sql` (generated via `migrate diff`).
- `backend/test/authorization.test.ts` — 5 cross-user isolation tests (skip without `DATABASE_URL`).
- **Blocked on manual step:** user must create a Neon project and put its connection string in
  `backend/.env` as `DATABASE_URL`. Then `prisma migrate deploy` + `npm test`.
- Supabase code is **not removed yet** (remove only after Neon replacement is verified working).
- Auth provider + AI-gateway fold-in + reference-data seeding are later phases.
