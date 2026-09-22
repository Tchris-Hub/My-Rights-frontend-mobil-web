# My Rights — Authentication Architecture

**Date:** 2026-09-22 · **Branch:** `auth-migration` (from `security-hardening-v1`)
**Decision:** **Better Auth** (server-side, in the My Rights backend) + **Prisma** + **Neon PostgreSQL**.
Supabase Auth is retired; its implementation is historical reference only.

---

## 1. Architecture

```
 Mobile (Expo SDK 54)                 Web (Next.js)
 ─────────────────────                ────────────────
 @better-auth/expo client             better-auth/react client
  • session cached in SecureStore      • httpOnly cookies
  • attaches Cookie header             • browser cookie jar
        │                                    │
        └────────── HTTPS ───────────────────┘
                          ▼
        ┌──────────────────────────────────────────────┐
        │        My Rights backend (Express + Node)     │
        │                                              │
        │  /api/auth/*  →  Better Auth handler          │
        │    • email/password + email verification      │
        │    • Google OAuth (authz code + PKCE)         │
        │    • DB-backed sessions (session table)       │
        │    • built-in rate limiting                   │
        │                                              │
        │  /api/chat/*  /api/escalations  /api/users/*  │
        │    • requireUser → userId from verified        │
        │      session (server-derived, never client)    │
        │    • Prisma ownership scoping (RLS equivalent) │
        └───────────────────┬──────────────────────────┘
                            │ Prisma
                            ▼
                  Neon PostgreSQL
                  ├─ user (canonical identity)
                  ├─ session / account / verification
                  ├─ chat_sessions / chat_messages
                  ├─ legal_escalation_requests
                  └─ privacy_consents

 External services: Google OAuth (authorization-code + PKCE),
                    SMTP (verification / reset / change-email emails)
```

**One authority.** Better Auth is the only identity/session system. No Supabase Auth, no custom
JWT. The authenticated `userId` is derived server-side from the Better Auth session and used to
scope every private database query.

## 2. Why Better Auth (not Clerk / Auth0 / custom)

| Requirement | Better Auth | Notes |
|---|---|---|
| Email/password + verification + reset + change | ✅ | `emailAndPassword` + email callbacks |
| Google OAuth + PKCE + external browser | ✅ | social plugin; `@better-auth/expo` uses `expo-web-browser` |
| Session persistence/refresh/expiry/revocation | ✅ | DB-backed `session` table; `revokeSessionsOnPasswordReset` |
| Secure mobile storage | ✅ | `expoClient` caches session in `expo-secure-store` |
| Prisma adapter (existing user model) | ✅ | `better-auth/adapters/prisma` takes our `PrismaClient` |
| Email change without enumeration | ✅ | `/change-email` no longer reveals registered emails |
| Account linking | ✅ | `linkSocial`, `account` table |
| Web + native from one server | ✅ | cookies (web) + bearer cookie (native) |
| Rate limiting | ✅ (basic) | built-in; harden at reverse-proxy for prod |
| MFA/passkeys later | ✅ | `twoFactor` / `passkey` plugins (not now) |

**Chosen over Clerk/Auth0:** those are external hosted services (new vendor, data-residency and
cost), and would introduce a second identity authority relative to our Prisma user model. **Chosen
over custom JWT:** the user explicitly directed against a hand-rolled protocol absent a documented
reason; Better Auth is audited and maintained. The one gap — production-grade abuse protection —
is closed at the reverse-proxy/rate-limit layer, not by reimplementing auth.

## 3. Canonical identity & Prisma integration

Better Auth's `user` table **is** our `users` table — one user table. We reshape the existing
`User` model to Better Auth's shape and keep our product columns:

- Better Auth required: `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`.
- My Rights extra: `phone_number`, `is_active`, `is_superuser`.
- Removed/replaced: `full_name` → `name`, `avatar_url` → `image`, `is_verified` → `emailVerified`,
  `has_accepted_terms` → derived from `privacy_consents`.
- Added tables: `session`, `account`, `verification` (Better Auth schema).

Existing FKs (`chat_sessions.user_id`, `legal_escalation_requests.user_id`,
`privacy_consents.user_id`) continue to reference `users.id` — authorization is unchanged.

## 4. Session model

- **Server authority:** sessions stored in Neon (`session` table) with hashed token, expiry,
  `ipAddress`, `userAgent`.
- **Web:** `httpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Mobile:** `@better-auth/expo` `expoClient` caches the session cookie in **SecureStore**
  (`storagePrefix: "myrights"`); authenticated requests attach it via the `Cookie` header using
  `authClient.getCookie()`.
- **Restore:** on native app start, the client reads the cached session from SecureStore (no
  loading spinner), then validates server-side.
- **Expiry/revocation:** sessions expire per config; logout and password-reset revoke sessions;
  `changePassword` supports `revokeOtherSessions`.
- **Offline:** cached session is used for optimistic identity display; any authenticated call
  re-validates server-side (fail-closed on 401).

**No passwords in the mobile app.** Only the session cookie/token in SecureStore.

## 5. User flows

### Registration
1. Sign up → name, email, password, confirm password, accept Terms, accept Privacy.
2. Client calls `authClient.signUp.email({ email, password, name, callbackURL })` with consent
   metadata (`terms_version`, `privacy_version`).
3. Server `databaseHooks.user.create.after` writes a `privacy_consents` row (terms_version,
   privacy_version, accepted_at, source) — historical, never overwritten.
4. `requireEmailVerification: true` → verification email sent via SMTP callback.
5. User verifies → `emailVerified = true` → signed in (per policy) → app.

**Handled:** duplicate email (uniform error, no account enumeration), invalid email, weak password
(min 8), mismatched passwords (client), expired/reused verification token (Better Auth single-use,
expiring), failed email delivery (resend), rate limiting, network failure (client retry), partial
signup (no verified email ⇒ no usable session).

### Login (email/password)
`authClient.signIn.email({ email, password })` → Better Auth verifies (argon2/bcrypt hash), checks
`requireEmailVerification`, creates session, returns cookie. Incorrect credentials and unverified
emails return uniform messages (no enumeration). Brute-force: Better Auth rate limit + reverse
proxy.

### Google
`authClient.signIn.social({ provider: "google", callbackURL })` → external browser (`expo-web-browser`,
**not** an embedded WebView) → Google consent → authorization code → PKCE exchange → Better Auth
verifies ID token, upserts account, creates session. `trustedOrigins` includes `myrights://`.
Account linking via `linkSocial`. Verified Google email is treated as `emailVerified`.

### Forgot password
`authClient.forgetPassword({ email, redirectTo })` → SMTP reset email (expiring, single-use) →
deep link → `authClient.resetPassword({ newPassword })`. `revokeSessionsOnPasswordReset: true`.
Uniform success message regardless of account existence.

### Change password (authenticated)
`authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })` (requires
current password = re-authentication for this sensitive op).

### Change email (authenticated)
Better Auth `change-email` sends confirmation to the new address; only on confirmation is `email`
updated. Does not reveal registration status of the target address.

### Logout
`authClient.signOut()` revokes the server session; client clears SecureStore session + all
account-scoped cached data (`localDataService.clearUserScopedData()`), guaranteeing no prior user
appears authenticated and account switching is clean.

## 6. Authorization integration

`backend/src/authz.ts` `requireUser` is rewritten: instead of the dev-only `x-user-id` header, it
validates the Better Auth session (`auth.api.getSession({ headers })` or the attached cookie) and
sets `req.userId = session.user.id`. All service functions keep their existing ownership scoping
(`where { user_id: userId }`), cross-user access → 404. **The 5 verified authorization tests are
kept and re-run against the new identity source.**

## 7. Security controls (OWASP-aligned)

- **Hashing:** Better Auth default (argon2id/bcrypt via `@node-rs/argon2`/scrypt) — never plaintext.
- **Password policy:** min 8 chars enforced server-side (`password.minLength`); client UX matches.
- **Brute force:** Better Auth `rateLimit` (window/max) + `rateLimit.storage` for multi-instance.
- **Session:** hashed tokens, expiry, revocation on logout/reset, `Secure`/`httpOnly`/`SameSite` on web.
- **PKCE** for native OAuth; **redirect URI** validated against registered URI; `trustedOrigins`.
- **No secrets in Expo:** only the public backend `baseURL`; Google/SMTP/DB secrets stay server-side.
- **No client-chosen identity:** `userId` always from the verified session.
- **Safe errors:** uniform auth messages (no enumeration); no stack traces to clients.
- **Audit logging:** security events without passwords/tokens/legal content (reuse `redacting logger` pattern).

## 8. Expo / Android stability

- **Existing:** Expo SDK `~54.0.30`, RN `0.81.5`, New Architecture, `expo-secure-store` present,
  `scheme: "myrights"` already set in `app.config.ts`.
- **Compatibility note:** Better Auth's Expo guide targets SDK 55. SDK 54 uses New Architecture, so
  we attempt `@better-auth/expo` on 54 first; if a peer-dep requires 55, that is a **separate,
  explicit upgrade decision** (not done blindly).
- **What can be tested in Expo Go:** email/password signup/login/logout, session restore, change
  password, email verification/reset via deep link using `exp://`, and the cookie-based backend
  flow. **What requires a development build:** anything needing the custom `myrights://` native
  scheme for Google OAuth (Expo Go uses `exp://`), and native Google Sign-In (`idToken` flow).
  **Production/preview build:** verifies release signing, `SecureStore` on a real keystore, and the
  final redirect behavior.

## 9. Supabase removal (on this branch, after Better Auth is verified)

- Remove `mobile/src/services/supabase.ts`, `@supabase/supabase-js`, `expo-auth-session` usage for
  Supabase, Supabase Auth env vars (`EXPO_PUBLIC_SUPABASE_URL/PUBLISHABLE_KEY`).
- Rewrite `AuthContext` + `auth.service.ts` to the Better Auth client; remove Supabase
  `onAuthStateChange`/`signInWithOAuth`/`resetPasswordForEmail`.
- Keep Supabase **database** code untouched until the Neon backend is fully wired (separate work).
- Ensure no second session store or auth authority remains.

## 10. Manual configuration (BLOCKING — must be provided by you)

| Item | Value needed | Secret? | Commit? |
|---|---|---|---|
| Google OAuth Web client | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | yes | NEVER |
| Google redirect URI | `${BETTER_AUTH_URL}/api/auth/callback/google` (register in Google Cloud) | no | n/a |
| Backend public URL | `BETTER_AUTH_URL` / `baseURL` (dev: tunnel or `http://<lan>:8080`; prod: hosted domain) | no | .env |
| Better Auth secret | `BETTER_AUTH_SECRET` (32+ random chars — I can generate) | yes | NEVER |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | yes | NEVER |
| Email sender | `EMAIL_FROM` (verification/reset/change emails) | no | .env |

## 11. Test matrix (automated where possible)

signup, duplicate signup, email verification, resend verification, login, invalid password,
logout, session restoration, session expiration, password reset, expired reset token, password
change, email change, Google login, OAuth callback, invalid OAuth callback, account linking,
unauthorized API request, expired session API request, cross-user data access, account switching,
app restart, offline/reconnect.

Backend (automated, vs Neon): signup/login/logout, session restore/expiry, reset-token expiry,
change password/email, cross-user isolation (existing 5 + auth-scoped), unauthorized/expired API
requests. Mobile (where practical): client-level unit tests for session caching + logout clearing.
Google OAuth + real email delivery require the manual config + a dev build (documented, not faked).

## 12. Definition of done

One auth authority; Neon/Prisma integration working; email signup + verification + login + logout +
session restore + password reset working; Google OAuth works where the dev-build env is available;
SecureStore verified; Terms/Privacy consent recorded server-side; `requireUser` derives identity
from the session; cross-user tests pass; Supabase Auth removed from this branch; no secrets
committed; mobile + backend typecheck pass; security regression + auth tests + release-integrity
checks pass.
