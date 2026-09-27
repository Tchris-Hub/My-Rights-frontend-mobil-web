# Phase 14 — Final Release Gate

## Purpose

Phase 14 converts the completed implementation work into a release-candidate gate. It does not replace native Android evidence with source checks, and it does not reopen completed feature phases unless the gate exposes a concrete release blocker.

## Release-gate layers

### 1. Repository integrity

The release candidate must have:

- one canonical Expo configuration ('mobile/app.config.ts');
- the expected Android package 'com.myrights.app';
- Android keyboard mode set to 'resize';
- an explicit production Android App Bundle configuration;
- no committed mobile environment file containing runtime secrets;
- a documented public backend origin in 'mobile/.env.example';
- no legacy Supabase client or legacy API service files;
- dependency and lockfile metadata consistent with the release checkout.

### 2. Automated verification

The release candidate must pass:

- TypeScript verification;
- E2E contract verification;
- release-gate contract verification;
- release-integrity verification;
- security regression checks.

These checks establish repository correctness. They do not establish native visual correctness.

### 3. Deterministic E2E coverage

All deterministic Maestro flows required by Phase 13 must exist and remain registered. Data-dependent marketplace and live-AI behavior must be backed by an explicit fixture or remain marked blocked.

### 4. Native Android evidence

At least one Android emulator or physical Android device must exercise the Phase 13 matrix, including:

- onboarding/auth and session recovery;
- consent;
- chat send/loading/keyboard/attachment/error;
- Constitution search/open/save;
- document generation and review loading/result states;
- legal-aid discovery and enquiry;
- profile, saved rights, privacy and support;
- navigation/deep links;
- background-job overlay;
- accessibility labels and touch targets.

For form-heavy flows, capture at least one keyboard-open and one loading state.

### 5. Production readiness

Before release, confirm:

- the backend production health contract is reachable;
- protected endpoints reject unauthenticated access as expected;
- request correlation headers/logging are present;
- no known release-blocking CI failure remains;
- the release candidate has a reproducible build configuration.

## Explicit non-passes

The following are not sufficient by themselves to mark Phase 14 complete:

- source-level test IDs;
- passing TypeScript;
- passing E2E contract scripts;
- a successful Vercel deployment;
- browser-only testing;
- a GitHub Actions run that failed before its test steps were provisioned.

## Acceptance checklist

- [ ] Repository integrity passes.
- [ ] Automated verification passes.
- [ ] All required deterministic E2E flows are present.
- [ ] Native Android matrix is exercised.
- [ ] Keyboard/loading/accessibility evidence is captured.
- [ ] No blocking Android visual or interaction defects remain.
- [ ] Production backend contract is verified.
- [ ] Release candidate build is reproducible.
- [ ] Final release decision is recorded.

Phase 14 is complete only when the evidence-backed checklist above is satisfied.
