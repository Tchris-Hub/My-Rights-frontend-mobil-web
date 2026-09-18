# Task 23 — Security Regression Test Suite

## Implementation status

**Implemented in source; verification deferred.**

### Changes

- Added `mobile/scripts/security-regression.mjs`, a dependency-free static regression suite covering:
  - release-path secret/config invariants;
  - SecureStore auth persistence;
  - Edge Function JWT/CORS/input/stream fail-closed invariants;
  - chat persistence and stream completion behavior;
  - document placeholder/fabrication regressions;
  - escalation RLS ownership controls;
  - legal-content log redaction;
  - removal of unused Axios and web-browser dependencies.
- Added `npm run test:security`.
- Added the suite to the mobile security workflow.

These are regression guards, not substitutes for runtime, RLS, device, or end-to-end security testing.

## Verification

Verification is intentionally **deferred** because GitHub Actions runner/account capacity is unavailable.

After remediation, run the static suite first, then the runtime/security regression sequence. A passing static suite alone must not be treated as proof of production security.
