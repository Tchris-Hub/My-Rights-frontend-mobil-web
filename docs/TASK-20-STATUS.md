# Task 20 — Dependency / Supply-Chain Review

## Implementation status

**Implemented in source; verification deferred.**

### Changes

- Removed unused direct dependencies `axios` and `expo-web-browser` from the mobile app and aligned the lockfile root dependency set.
- Added `mobile/.npmrc` to pin the public npm registry, enable npm audit, disable donation/funding noise in CI, and enforce the Node engine declaration.
- Added a blocking `npm audit --audit-level=high` step to the mobile security workflow.
- The app's current legal-advisor gateway uses native `fetch`, so removing unused Axios eliminates an unnecessary HTTP client attack surface.

### Current supply-chain evidence

Current public Axios security advisories show multiple 2026 vulnerabilities affecting older 1.x releases, including issues with fixes at later 1.x versions. The repository did not need Axios for its current mobile code path, so removal is preferred to carrying an unnecessary vulnerable dependency.

Supabase's current security guidance recommends pinning Edge Function npm dependencies, using lockfiles, and using provenance/signature checks where appropriate. The repository's Edge Function currently uses an exact JSR import for `@supabase/supabase-js`, while the mobile app uses a committed npm lockfile.

### Verification

Verification remains **deferred** because GitHub Actions runner/account capacity is unavailable.

When verification resumes, check:
1. `npm ci` succeeds from the committed lockfile;
2. `npm audit --audit-level=high` is clean;
3. no removed package is required at runtime;
4. all direct and transitive dependencies have expected registry/integrity metadata;
5. dependency provenance/signature review is completed where supported.
