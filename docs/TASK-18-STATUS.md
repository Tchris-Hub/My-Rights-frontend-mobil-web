# Task 18 — Security Logging / Observability

## Implementation status

**Implemented in source; verification deferred.**

### Changes

- Added privacy-safe structured audit events to the `legal-advisor` Edge Function.
- Security/provider events record only operational metadata such as event type, request correlation ID, HTTP status, and stream mode.
- Legal message text, prompts, tokens, provider responses, and request bodies are explicitly excluded from these audit events.
- Added client logger redaction for legal/personal content fields such as `content`, `documentText`, `reason`, `userDetails`, `intakeData`, `query`, and `prompt`.
- Routed known screen-level errors through the centralized redacting logger instead of direct console calls.
- Gateway records authentication rejection, rate limiting, provider rejection, invalid provider response, successful completion, and unexpected request failure events.
- Existing client logger remains development-only; no production legal-content console logging was introduced.

## Verification

Verification is intentionally **deferred** because GitHub Actions runner/account capacity is currently unavailable. No claim is made that the logging paths, event output, retention configuration, or production observability integration have passed runtime verification.

Post-remediation verification must inspect:
1. no sensitive legal/user content appears in application or Edge Function logs;
2. expected security events are emitted for auth/rate/provider failures;
3. logs remain operationally useful without storing unnecessary personal/legal data;
4. production log retention/access controls are configured outside source code as required.
