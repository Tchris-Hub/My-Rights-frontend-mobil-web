# My Rights — Release Evidence Record

This directory records the evidence required to close the final Android release gate.

## Evidence status

**Current status: NOT COMPLETE**

The repository and automated checks must not be interpreted as native Android verification. Device evidence must be added by running the Maestro matrix on an Android emulator or physical device.

## Required record

| Field | Required value |
|---|---|
| Device/emulator | Record exact model |
| Android version | Record exact version |
| Screen size | Record resolution |
| Build | Record exact APK/AAB or development build identifier |
| Backend | Record API environment used |
| Date/time | Record execution time |
| Operator | Record who exercised the flows |

## Flow evidence

Record one row for each required flow in `docs/PHASE-13-E2E-MATRIX.md`.

| Flow | Result | Evidence | Defect / note |
|---|---|---|---|
| Boot/onboarding | PENDING | — | — |
| Authentication/session recovery | PENDING | — | — |
| Consent | PENDING | — | — |
| Chat | PENDING | — | — |
| Constitution | PENDING | — | — |
| Document generation | PENDING | — | — |
| Document review | PENDING | — | — |
| Legal-aid discovery/enquiry | PENDING | — | — |
| Profile/privacy/support | PENDING | — | — |
| Navigation/deep links | PENDING | — | — |
| Professional enquiry | PENDING | — | — |
| Navigation accessibility | PENDING | — | — |

## Required state evidence

At minimum, record evidence for:

- one keyboard-open state;
- one loading state;
- one empty state;
- attachment interaction;
- consent recovery;
- session recovery;
- accessibility labels/touch targets;
- absence of clipping or overlap.

## Live-service rule

Do not mark AI, marketplace, authentication-provider, or other live-service behavior as passed merely because the screen renders. Record the fixture/environment and the actual observed result, or mark the flow blocked.

## Closure rule

Phase 14 cannot be marked complete while any required row remains **PENDING**, **BLOCKED**, or **FAIL**, unless the release decision explicitly records why the item is outside the release scope.
