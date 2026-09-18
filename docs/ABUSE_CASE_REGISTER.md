# My Rights — Abuse-Case Register

| ID | Abuse case | Expected behavior | Test status |
|---|---|---|---|
| AC-01 | Unauthenticated caller invokes legal-advisor | Reject with authentication error | Deferred |
| AC-02 | Client sends service-role/privileged token shape | Reject | Deferred |
| AC-03 | Client sends system/developer/assistant message | Reject | Deferred |
| AC-04 | Client omits jurisdiction | Reject | Deferred |
| AC-05 | Client supplies unsupported jurisdiction | Reject | Deferred |
| AC-06 | Oversized body/message | Reject | Deferred |
| AC-07 | Rate limit exceeded | Reject without provider call | Deferred |
| AC-08 | Provider returns non-2xx | Sanitized failure, no fabricated answer | Deferred |
| AC-09 | Provider stream truncates before completion | Fail closed; no assistant success persisted | Deferred |
| AC-10 | Provider stream exceeds output cap | Fail closed | Deferred |
| AC-11 | Chat history requested without auth | Reject | Deferred |
| AC-12 | User queries another user's conversation | RLS denies access | Deferred |
| AC-13 | User inserts escalation for another user's conversation | RLS denies insert | Deferred |
| AC-14 | User updates/deletes escalation status | Denied by policy | Deferred |
| AC-15 | Malicious document exceeds size/type limits | Reject | Deferred |
| AC-16 | Document contains prompt-injection instructions | Treat as untrusted evidence | Deferred |
| AC-17 | OCR/authenticity feature unavailable | Explicit unavailable error, not fake result | Deferred |
| AC-18 | Dependency vulnerability appears | CI audit gate fails | Deferred |
| AC-19 | Legacy backend/config appears in release path | Static release check fails | Deferred |
| AC-20 | Auth session is inspected in generic app storage | No session there; SecureStore owns it | Deferred |

This register is a test plan and threat-model artifact, not runtime evidence.
