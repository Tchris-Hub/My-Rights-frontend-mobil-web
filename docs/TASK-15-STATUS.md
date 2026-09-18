# Task 15 — Build / Release / Production Configuration Integrity

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Made `mobile/app.config.ts` the canonical Expo application configuration by removing the duplicate `mobile/app.json`.
- Added explicit Node.js >=20 engine requirement to the mobile package.
- Added reproducible `typecheck`, `doctor`, and `verify:release` npm scripts.
- Added `mobile/scripts/release-integrity.mjs` to fail on:
  - checked-in `.env`
  - duplicate Expo configuration
  - legacy backend/config paths
  - missing required verification scripts
  - package.json/package-lock root dependency drift
  - missing/incorrect EAS production Android bundle configuration
  - legacy or secret-like environment variable names in `.env.example`
  - missing canonical Supabase client variables
  - missing expected Expo/EAS identity configuration
- Updated the security-hardening workflow to invoke the deterministic release check and the named typecheck/doctor scripts.
- Removed the workflow's stale `app.json` path check after making app.config.ts canonical.
- Existing `.gitignore` continues to exclude local environment files and generated native folders.

## Release-path principle

The mobile client contains only public Supabase client configuration. AI-provider credentials and privileged server credentials remain server-side. The release configuration must not silently point at a legacy backend.

## Verification deferred

The release-integrity script, TypeScript compiler, Expo Doctor, Expo config evaluation, dependency installation, and actual EAS release build have not been executed in the current remediation phase because verification is intentionally deferred. No release/build pass is claimed.
