# My Rights — Formal Threat Model

**Status:** Implemented as a source-of-truth design document. Runtime verification is deferred.

## 1. Scope

In scope:
- Expo/React Native mobile client
- Supabase Auth
- Supabase Postgres/RLS
- Supabase Storage
- Supabase Edge Function `legal-advisor`
- external AI provider boundary
- legal-source registry
- authenticated chat/document workflows
- human legal escalation queue
- local device storage and permissions
- release/build configuration

Out of scope:
- compromise of the user's physical device/OS
- compromise of Supabase infrastructure itself
- compromise of the external AI provider
- staff/provider operational systems not present in this repository

## 2. Assets

| Asset | Sensitivity | Primary protection |
|---|---|---|
| Auth session/refresh token | Critical | SecureStore, Supabase Auth |
| Legal chat text | High | Auth, RLS, no generic local cache, bounded gateway |
| Uploaded/document text | High | validation, untrusted-text boundaries, bounded processing |
| User profile | High | Auth + RLS |
| Legal source records | High | registry fields, verified-read policy, server controls |
| AI provider credential | Critical | Edge Function environment only |
| Escalation reason/request | High | authenticated insert/select + RLS |
| Release configuration | High | single Expo config, static release checks |

## 3. Trust boundaries

1. **Device → Supabase:** the mobile client is untrusted. Client checks are UX controls only.
2. **Client → Edge Function:** JWT, method, CORS, body, message, jurisdiction, and rate controls are enforced server-side.
3. **Edge Function → AI provider:** provider credentials and system instructions are server-owned; provider output is untrusted.
4. **Client → Postgres:** RLS is the authorization boundary for private rows.
5. **Document → AI:** document content is untrusted evidence, never instructions.
6. **Legal source registry → AI/UI:** verification status and effective dates constrain authoritative claims.
7. **Escalation queue → human service:** a stored request is not evidence of lawyer acceptance or response.

## 4. Principal threats and controls

### T1 — Client bypass of authorization
**Threat:** a modified client reads or writes another user's records.

**Controls:** Supabase RLS, server-side JWT validation, ownership policies, authenticated service methods.

**Residual verification:** live RLS adversarial tests are still required.

### T2 — AI prompt injection
**Threat:** user/document content attempts to override system instructions or exfiltrate secrets.

**Controls:** only user-role messages accepted from clients; server-owned system prompt; explicit untrusted-document framing; no provider secret in client.

**Residual verification:** prompt-injection regression corpus.

### T3 — Jurisdiction substitution
**Threat:** a user receives Nigerian-looking legal output for an unsupported jurisdiction or the model silently assumes a jurisdiction.

**Controls:** explicit Nigeria jurisdiction required by client and gateway; server rejects unsupported values.

**Residual verification:** API fuzzing and UI bypass tests.

### T4 — Fabricated legal authority
**Threat:** model invents statutes, cases, citations, lawyer credentials, verification, or legal validity.

**Controls:** legal-source registry, unverified citation status, explicit model instructions, lawyer verification state, no fabricated ratings/credibility.

**Residual verification:** citation/source regression corpus and source registry review.

### T5 — Partial/failed AI stream treated as success
**Threat:** network/provider truncation produces an apparently complete answer.

**Controls:** explicit stream completion marker, buffered SSE parsing, output cap, stream errors fail closed.

**Residual verification:** interrupted-stream integration tests.

### T6 — Sensitive data left on device
**Threat:** auth tokens or legal chat survive logout/account switching in plaintext local storage.

**Controls:** SecureStore auth persistence, disabled generic chat cache, scoped local cleanup.

**Residual verification:** device filesystem/storage inspection.

### T7 — Malicious document
**Threat:** a document contains prompt injection or malformed/oversized content.

**Controls:** MIME/extension/size validation, untrusted-text wrapping, input caps, no execution/preview in chat flow.

**Residual verification:** malicious file corpus and parser isolation testing.

### T8 — Escalation impersonation or cross-user access
**Threat:** attacker creates or reads another user's human-assistance request.

**Controls:** authenticated insert/select and conversation ownership RLS; no client status update/delete.

**Residual verification:** cross-user RLS tests and operational workflow review.

### T9 — Dependency compromise
**Threat:** malicious or vulnerable npm dependency compromises build/runtime.

**Controls:** committed lockfile, npm audit gate, registry pinning, dependency removal, static dependency regression checks.

**Residual verification:** clean install, audit, provenance/signature checks.

### T10 — Release-path drift
**Threat:** legacy backend, duplicate config, or secret enters the release.

**Controls:** single Expo config, release-integrity script, static regression suite, CI checks.

**Residual verification:** clean build and artifact inspection.

## 5. Security invariants

A release must preserve all of these:
- no server/provider secret in the mobile bundle;
- no client-controlled authorization decision;
- no private-row access without ownership;
- no unsupported jurisdiction silently accepted;
- no incomplete AI response presented as complete;
- no unverified legal citation presented as authoritative;
- no fabricated lawyer/provider verification;
- no generic plaintext legal-chat cache;
- no fake human-escalation success;
- no release-path legacy backend fallback.

## 6. Residual risks

The highest remaining risks are operational/runtime verification: deployed RLS state, live Edge Function configuration, provider behavior, device storage inspection, dependency audit output, and human-service operational controls. These are intentionally not marked verified until the deferred verification sequence is run.
