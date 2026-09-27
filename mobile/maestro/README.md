# My Rights E2E flows

These flows use Maestro against the Android package `com.myrights.app`.

## Automated flows

- `flows/01-auth-validation.yaml` — boot, onboarding progression, auth form validation.
- `flows/02-guest-chat-shell.yaml` — boot, guest entry, chat input visibility, keyboard dismissal.
- `flows/03-constitution.yaml` — Constitution search and keyboard handling.
- `flows/04-constitution-navigation.yaml` — Tools → Constitution navigation.
- `flows/05-legal-aid.yaml` — Tools → Legal Aid discovery shell.
- `flows/06-privacy.yaml` — Profile → Privacy Center data controls.

Run against an installed Android development or preview build with `npm run e2e:maestro`.

These flows intentionally avoid real Google authentication and AI submission. Device execution remains required evidence for Phase 13 and does not get replaced by static/type checks.
