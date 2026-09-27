# My Rights E2E flows

These flows use [Maestro](https://maestro.mobile.dev/) against the Android package `com.myrights.app`.

## Current automated flows

- `flows/01-auth-validation.yaml` — boot, onboarding progression, auth form validation.
- `flows/02-guest-chat-shell.yaml` — boot, guest entry, chat input visibility, keyboard dismissal.

## Running locally

Build/install an Android development or preview build first, then run:

```bash
maestro test maestro/flows/01-auth-validation.yaml
maestro test maestro/flows/02-guest-chat-shell.yaml
```

These flows intentionally avoid real Google authentication and AI submission. They verify deterministic UI contracts without requiring production credentials.

## Release gate

Maestro execution on a physical Android device or emulator remains required evidence for Phase 13. The repository files are the automated test definition; a passing typecheck does not substitute for device execution.
