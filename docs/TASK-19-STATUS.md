# Task 19 — Secrets / Configuration Hygiene

## Implementation status

**Implemented in source; verification deferred.**

### Changes

- Removed the unused duplicate `mobile/config.json` so Expo release configuration has a single authoritative `mobile/app.config.ts` source.
- Preserved the client/server trust boundary: mobile configuration contains only public Supabase connection values; provider/API secrets remain server-side.
- No new secrets or fallback backend endpoints were introduced.
- Existing release-integrity checks continue to reject legacy Railway URLs, private-key/service-role/OpenRouter-style secret names, and legacy API configuration in the mobile release path.

## Verification

Verification is intentionally **deferred** because GitHub Actions runner/account capacity is currently unavailable.

After all remediation phases are implemented, verify:
1. repository history and current tree contain no committed server/provider secrets;
2. Expo's resolved config contains only intended public configuration;
3. no alternate/legacy backend configuration can be selected at build time;
4. CI/build environments provide server secrets only through the appropriate secret store;
5. secret scanning and release-integrity checks pass.
