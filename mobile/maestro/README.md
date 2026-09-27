# My Rights E2E flows

These flows use Maestro against the Android package `com.myrights.app`.

## Automated flows

- `flows/01-auth-validation.yaml` — boot, onboarding progression, auth form validation.
- `flows/02-guest-chat-shell.yaml` — boot, guest entry, chat input visibility, keyboard dismissal.

Run against an installed Android development or preview build with `npm run e2e:maestro`.

These flows intentionally avoid real Google authentication and AI submission. Device execution remains required evidence for Phase 13 and does not get replaced by static/type checks.
