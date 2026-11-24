# My Rights E2E flows

These flows use Maestro against the Android package `com.myrights.app`.

## Automated flows

- `flows/01-auth-validation.yaml` — boot, single-screen onboarding, sign-in form validation.
- `flows/02-guest-chat-shell.yaml` — guest entry, Home, Ask tab, chat input stays visible with the keyboard open.

Run against an installed Android development or preview build with `npm run e2e:maestro`.

These flows intentionally avoid real Google authentication and AI submission. Device execution remains required evidence for Phase 13 and does not get replaced by static/type checks.
