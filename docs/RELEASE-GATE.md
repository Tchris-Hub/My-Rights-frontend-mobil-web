# My Rights — Final Release Gate

## Purpose

This is the final evidence gate for the Android-first My Rights release. It consolidates the remaining verification from Phases 12 and 13 without treating source-code checks as substitutes for device evidence.

## Verified in repository/CI

- Mobile TypeScript verification passes on the Phase 13 branch.
- Mobile E2E contract checks are part of CI.
- Maestro flows exist for deterministic onboarding/auth validation and guest chat keyboard behavior.
- Android keyboard layout mode is explicitly `resize`.
- Chat input uses Android height-aware keyboard avoidance and dismiss behavior.
- Keyboard-visible floating UI and custom tab chrome are suppressed.
- Background job overlay is hidden while the keyboard is open and remains blocking when a job is actively running without the keyboard.
- Global JS ErrorBoundary exists.
- Production logger suppresses console output and redacts sensitive fields in development logs.
- Backend request IDs and request timing/status logging are implemented.
- Production smoke script checks public endpoints, protected 401 behavior, and `X-Request-Id`.
- Backend preview deployments reached READY.
- Stable production endpoints have been manually checked for the expected response contract.

## Device evidence still required

Run the Maestro flows on at least one Android emulator or physical Android device:

1. `maestro/flows/01-auth-validation.yaml`
2. `maestro/flows/02-guest-chat-shell.yaml`

Then exercise the full Phase 13 matrix in `docs/PHASE-13-E2E-MATRIX.md`.

Capture evidence for:

- onboarding/auth
- consent recovery
- chat send/loading/keyboard/attachment/error
- Constitution search/open/save
- document generation loading/result
- document review loading/result
- legal-aid discovery/matching/enquiry
- profile/edit/saved-rights/privacy/support
- navigation/deep links
- background-job loading
- at least one loading and one keyboard-open state for each form-heavy flow
- accessibility labels and touch targets
- no clipping, overlap, or content hidden behind the keyboard

## External CI note

GitHub Actions backend run 36296755912 failed before any job steps were provisioned (`steps: null`). This is an infrastructure/runner failure, not an application test failure. The backend branch nevertheless produced READY Vercel preview deployments and the existing production endpoint contract remains healthy.

## Release decision rule

Do not call the Android release fully verified until the device evidence above is captured and reviewed. Code-level CI success, a Vercel build, or a passing web/browser check does not substitute for native Android visual/accessibility verification.
