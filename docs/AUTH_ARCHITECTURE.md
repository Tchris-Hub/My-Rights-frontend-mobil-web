# My Rights — Authentication Architecture

**Updated:** 2026-09-23  
**Decision:** Better Auth on the My Rights backend + Prisma + Neon PostgreSQL.

Supabase Auth is retired. Better Auth is the only identity/session authority.

## 1. Authentication methods

My Rights exposes exactly two sign-in methods:

1. **Email magic link** — the user enters an email address and receives a single-use link.
2. **Google OAuth** — Better Auth handles the OAuth flow and session creation.

There is no password creation, password login, password reset, or change-password flow.

The Better Auth magic-link plugin uses a 5-minute expiry and hashed verification-token storage. Verification is single-use. Authentication email delivery is server-side through SMTP; SMTP credentials never enter the mobile or web bundles.

## 2. Architecture

```
Expo Android / iOS                 Next.js web
        │                              │
        └──────── HTTPS / cookies ─────┘
                       │
                       ▼
        My Rights backend (Express)
        /api/auth/* → Better Auth
          • magic link
          • Google OAuth
          • DB-backed sessions
          • rate limiting
                       │
                       ▼
                 Neon PostgreSQL
          users / session / account /
          verification / privacy_consents
```

The authenticated user ID is derived server-side from the Better Auth session. Private services never accept a client-supplied user ID.

## 3. Email magic-link flow

1. User enters an email address.
2. Client calls `POST /api/auth/sign-in/magic-link`.
3. Better Auth creates or locates the account and generates a short-lived verification token.
4. The server sends the link through SMTP.
5. The link is opened in the app/browser and Better Auth verifies it.
6. The server creates the normal DB-backed session.
7. The app refreshes its session and profile.
8. If current Terms/Privacy consent is missing, the app shows the Consent screen before private API access.

Magic-link requests are rate-limited. Client-visible errors remain generic.

## 4. Google flow

The client calls Better Auth's Google social sign-in with a relative callback URL. The Expo plugin converts the callback to the configured app deep link. Native OAuth uses the external browser flow rather than an embedded WebView.

Production trusted origin: `myrights://`.

Expo `exp://**` trusted-origin patterns are development-only and are not part of the production backend policy.

## 5. Sessions

- Sessions are stored in Neon.
- Mobile cookies/session state are handled by `@better-auth/expo` and SecureStore.
- Authenticated API requests attach the Better Auth cookie.
- Sessions expire after 7 days unless refreshed according to Better Auth's session policy.
- Logout revokes the server session and clears user-scoped local data.

## 6. Consent

Authentication and legal consent are separate concerns.

After magic-link or Google authentication, the app checks the current Terms/Privacy versions through `/api/consent`. Private APIs such as chat, AI, and escalations require both an authenticated session and current consent.

Consent is recorded server-side in `privacy_consents`; the client cannot mark itself consented without a successful server response.

## 7. Database

The existing nullable `Account.password` column is retained during this migration for compatibility with any historical records. It is not used by the authentication configuration and no password endpoint is exposed.

The existing Better Auth `verification` table is reused for magic-link verification tokens. No destructive password-column migration is required for the initial passwordless rollout.

## 8. Mobile configuration

The Expo client reads `EXPO_PUBLIC_API_BASE_URL` when supplied and otherwise uses the production backend:

`https://alpha01-pink.vercel.app`

The app scheme is `myrights://`.

Do not put Google client secrets, SMTP credentials, database credentials, or Better Auth secrets in Expo public variables.

## 9. Security controls

- Magic-link tokens expire after 5 minutes.
- Magic-link tokens are stored hashed.
- Verification is single-use.
- Magic-link requests are rate-limited.
- Google OAuth uses Better Auth's native Expo integration and validated callbacks.
- Sessions are server-authoritative and DB-backed.
- Private API authorization derives `userId` from the verified session.
- Consent-protected APIs fail closed when current consent is absent.
- Authentication errors shown to users do not reveal whether an email belongs to an account.

## 10. Verification checklist

Backend:
- `GET /api/auth/get-session` returns a valid unauthenticated response.
- Magic-link request succeeds with configured SMTP.
- Magic-link verification creates a session.
- Replaying the same token fails.
- Protected APIs reject unauthenticated requests.
- Consent-gated APIs reject authenticated users without current consent.
- Logout revokes the session.

Mobile:
- No password fields or password auth methods remain.
- Email magic-link request opens the sent-link screen.
- Opening the magic link restores the Better Auth session.
- Google OAuth uses the `myrights://` production scheme.
- Consent is required before private features.
