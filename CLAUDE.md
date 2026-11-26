# My Rights — Repository Knowledge Base

> Refreshed 2026-11-26. The old text (2026-09-22) described a different branch layout and an in-repo backend; it is replaced.

## 1. Two repos, on purpose

| Repo | Holds | Deployed |
|---|---|---|
| `Tchris-Hub/My-Rights-frontend-mobil-web` (this repo) | `mobile/` Expo app, `frontend/` Next.js site, `docs/` | APK via EAS |
| `Tchris-Hub/alpha01` (private) | `backend/` — the **only** live backend | Vercel |

**Do not move `alpha01` into this repo or rename/recreate its Vercel project.** Creating a hosting account under a name that looked like a professional app was flagged, and a flagged account loses its free plan. The old in-repo `backend/` copy was removed; do not re-add a second backend here.

Mobile reads the API URL from `EXPO_PUBLIC_API_BASE_URL` (default `https://alpha01-pink.vercel.app`).

## 2. This repo

- `mobile/` — Expo SDK 57, React Native 0.86, React 19, TypeScript, React Navigation 7 (not Expo Router), Better Auth Expo client + SecureStore, MapLibre/MapTiler, document scanner. Needs a custom dev build, not Expo Go.
- `frontend/` — Next.js 16 marketing/demo site. Still points at the old Railway API; needs rewiring or retiring.
- `supabase/` — legacy Supabase edge function and migrations, superseded by Neon/Prisma in `alpha01`.
- `docs/` — threat model, privacy docs, `TASK-*` status files, `docs/product-recovery/` (the current phased plan, 0–14).

App flow (`mobile/src/navigation/RootNavigator.tsx`): Splash → Onboarding → Auth (login, magic-link-sent, consent) → Main (Chat, Tools stack, Profile stack).

## 3. Backend facts (`alpha01/backend`)

Express 4 + Better Auth (magic link + Google, no passwords) + Prisma 5 on Neon + DeepSeek. Per-route middleware: `requireUser` → `requireConsent` (current terms/privacy version) → `requireSuperuser` for admin routes.

Key pieces: AI chat with legal grounding and citation validation, idempotency keys + encrypted replay, free-plan quotas (4 chats, 2 reviews, 2 generations per day), document extraction (PDF/DOCX/TXT/image), professional profiles and firms with an admin verification queue, enquiries (pending → accepted/declined → closed) with notifications, saved rights, data requests, user reports, account type (`client` | `legal_professional`), explainable matching (`/api/legal/professionals/match`, `/firms/match`).

## 4. Lawyer side today

A user can set account type to `legal_professional`, fill a professional profile (role, practice areas, service areas, languages, fee band, bar details, firm membership), and receive enquiries. A superuser verifies profiles and firms; only verified profiles appear in public listings and can receive enquiries. Not built yet: structured case intake, triage, case assignment inside a firm, SLA/re-offer, admin console UI.

## 5. Rules already decided (keep)

Verified-evidence-only AI answers with `[S1]`-style labels; no numeric risk/confidence scores; untrusted-document wrapping; students are never labelled lawyers; no public "best lawyer" ranking; honest verification labels; assistant messages are server-written only.

## 6. Known open issues (see the Project audit for the full ranked list)

1. Client shows old assistant messages that lack `citation_status` (should show only `verified_context` / `live_research`).
2. Escalation: mobile sends `conversation_id`, backend reads `conversationId`; escalations also have no recipient.
3. Matching treats "no fee band set" as a fee-band match, so unfilled profiles match every query.
4. `/professionals/match` ignores `publish_bar_admission_number` and returns the bar number publicly.
5. Recipient enquiry list returns client email and phone before the enquiry is accepted.
6. Onboarding copy still says "EDITORIAL AUTHORITY", "LEGAL PRECISION", "binding documents instantly".
7. App icon and onboarding art are AI renders; coat of arms rendered in wrong colours.
8. `security-hardening-mobile.yml` uses a self-hosted Windows runner on pull requests in a public repo.
9. Scratch files tracked in `mobile/` (`bugui/*.mp4`, `ts_errors.txt`, `clean_errors.txt`, `test_*`, `temp_onboarding.html`, `example.md`, `fix-prompts.md`).

## 7. Goals (owner)

Reform the app flow (clean start animation, then onboarding), remove the AI-generated look, make it unmistakably Nigerian (green theme, Nigerian people and places, coat of arms used appropriately), build the lawyer interface, and design the data structures and algorithms for clients and lawyers as one system. First pilot partner: the law clinic at Nasarawa State University, Keffi.

## 8. Conventions

- Screens in `mobile/src/screens/{auth,main,profile,common}/`, services in `mobile/src/services/`, contexts in `mobile/src/contexts/`.
- Logging through `mobile/src/utils/logger.ts` (redacts, `__DEV__`-gated).
- EAS profiles: `development`, `preview` (apk), `apk`, `production` (aab).
- Author: Tochukwu Praize Chimezie (academic project).
