# My Rights — Before/After Security Remediation Record

**Purpose:** Preserve a clear, auditable comparison between the audited `stitch-supabase-redesign` baseline and the hardened `security-hardening-v1` implementation.

**Baseline commit:** `ab1e62a141f5f26842639a20d266485a624f162b5`  
**Remediation branch:** `security-hardening-v1`  
**Current branch tip:** `58177e85b89c83b8b8e12d4b2d55a52743375376`

> **Important:** “Implemented” below means the source remediation exists. It does **not** mean the deployed/runtime control has passed verification. Runtime and adversarial verification was deliberately deferred because GitHub Actions runner/account capacity was unavailable.

---

## Executive comparison

The baseline review found a system whose trust boundaries were too dependent on the mobile client, whose AI gateway accepted too much client-controlled behavior, whose privacy/product claims exceeded what had been demonstrated, and whose authorization, document, legal-source, persistence, release, and operational controls lacked sufficient evidence.

The remediation changed the architecture toward:

**Mobile App → Supabase Auth → Postgres/Storage protected by RLS → authenticated Edge Function → server-owned AI policy → bounded/untrusted AI processing → controlled provider**

The most important principle is now explicit throughout the codebase:

**The mobile client is untrusted. Client-side checks are UX controls; authorization and security decisions belong at the server/database boundary.**

---

# 1. Architecture / release-path integrity

### Baseline flaw

The audited branch contained stale/alternate backend paths, including Railway configuration and legacy client implementations. There was not enough evidence that the release path had exactly one authoritative backend/configuration.

### What changed

- Removed the legacy mobile API/Supabase client paths.
- Removed the Railway production URL from mobile configuration.
- Established one canonical Supabase client.
- Removed duplicate `mobile/app.json`.
- Kept Expo configuration authoritative in `mobile/app.config.ts`.
- Added deterministic release-integrity checks.
- Added CI checks for forbidden legacy endpoints/configuration.
- Added explicit EAS production/preview Android build configuration.

### Resulting design

The release path is now intended to be:

**Mobile → Supabase Auth/API → Postgres/Storage + RLS → Edge Functions → controlled AI provider**

### Evidence

- `mobile/src/services/supabase.ts`
- `mobile/app.config.ts`
- `mobile/scripts/release-integrity.mjs`
- `.github/workflows/security-hardening-mobile.yml`

**Verification:** Deferred.

---

# 2. AI gateway trust boundary

### Baseline flaw

The AI pipeline allowed client-controlled privileged message roles, including a `system` role path. Request limits, authentication enforcement, provider selection, and abuse controls were insufficiently demonstrated.

### What changed

The Edge Function now:

- requires a Bearer user JWT;
- rejects invalid/privileged token shapes;
- validates the authenticated user;
- accepts only client `user` messages;
- owns the system prompt server-side;
- fixes the provider/model server-side;
- requires explicit supported jurisdiction;
- limits body size, message count, message size and total content;
- limits output/stream size;
- rate-limits requests;
- keeps the OpenRouter credential server-side;
- uses explicit CORS allow-listing rather than wildcard CORS;
- sanitizes unexpected internal errors.

### Resulting security boundary

A modified mobile client cannot legitimately replace the AI system instructions, select an arbitrary provider/model, omit jurisdiction, or bypass the gateway's basic input controls.

**Verification:** Deferred.

---

# 3. Supabase authorization / RLS

### Baseline flaw

Private-data isolation was not sufficiently proven. IDOR/cross-account access remained a critical concern.

### What changed

Added a fail-closed RLS baseline migration covering:

- `users`;
- `chat_sessions`;
- `chat_messages`;
- applicable public reference data;
- human escalation requests.

Policies use authenticated ownership, including parent-session ownership for messages.

The escalation table also verifies that a referenced conversation belongs to the submitting user.

### Important limitation

The migration existing in Git does **not** prove that it is deployed correctly to the live Supabase project. That remains a verification gate.

**Verification:** Deferred.

---

# 4. Sensitive legal data / privacy claims

### Baseline flaw

Privacy language included claims that were stronger than the demonstrated implementation, including “Incognito • Zero-Trace” and claims about what identifiers were/weren't transmitted to AI providers.

### What changed

- Replaced “Incognito • Zero-Trace” with accurate private-session wording.
- Removed “AI verified” wording.
- Added a documented privacy data-flow record.
- Added a privacy processing register.
- Added consent/version metadata.
- Added explicit Terms/Privacy versions.
- Avoided claiming provider zero-retention where it has not been verified.
- Documented remaining provider/retention/deletion questions instead of pretending they are solved.

### Resulting principle

**The product claims only what the implementation and available evidence support.**

**Verification:** Deferred.

---

# 5. Local data isolation / logout

### Baseline flaw

Legal/chat information could persist locally without sufficiently demonstrated isolation between accounts.

### What changed

- Disabled generic local chat caching.
- Added account-scoped local-data cleanup.
- Added active-user tracking.
- Logout/account switching clears user-scoped application data.
- Supabase Auth session storage was subsequently moved from AsyncStorage to SecureStore.

### Resulting behavior

Generic application storage is no longer the intended persistence layer for authenticated legal chat history, and auth credentials have a dedicated secure-storage boundary.

**Verification:** Deferred.

---

# 6. Legal-product positioning / reliance risk

### Baseline flaw

The UI and AI behavior contained authority/reliance language such as “EDITORIAL AUTHORITY,” “LEGAL PRECISION,” “AI verified,” “THE PLAIN TRUTH,” “LEGAL STANDING,” and similar formulations that could cause users to over-rely on generated information.

### What changed

- AI system instructions explicitly state that the service provides general legal information, not legal advice or representation.
- The AI cannot claim to be a human lawyer.
- It cannot predict case outcomes.
- It cannot assign numerical legal-risk/confidence scores.
- High-stakes matters are directed toward qualified Nigerian legal practitioners or official services.
- Document review wording was changed from authority/risk language to general review language.
- Human escalation wording avoids promising lawyer acceptance.

**Verification:** Deferred.

---

# 7. Lawyer / legal-aid directory integrity

### Baseline flaw

Directory mapping could present fabricated-looking review counts, “Verified Partner” labels, recommendations, or credibility information without defensible source evidence.

### What changed

- Removed fabricated credibility/rating behavior.
- Added explicit verification status/source/date fields.
- Distinguished verified from unverified records.
- Added legal-source registry concepts for authoritative verification.
- Human escalation is no longer represented as automatically accepted by a lawyer.

### Important limitation

A field saying “verified” is not itself proof of verification. Source records and operational verification still need to be populated and tested.

**Verification:** Deferred.

---

# 8. Document analysis / malicious-file handling

### Baseline flaw

Uploaded documents were insufficiently treated as hostile/untrusted input and document processing boundaries were not adequately defined.

### What changed

Added document-security controls for:

- maximum file size;
- MIME allow-list;
- extension allow-list;
- MIME/extension consistency;
- sanitized names;
- text-size limits;
- explicit untrusted-document boundaries.

Document-service handling now treats extracted document text as untrusted data rather than instructions.

Unsupported OCR/authenticity functionality now **fails closed** instead of returning misleading placeholder success.

**Verification:** Deferred.

---

# 9. AI legal citation/source integrity

### Baseline flaw

The AI was instructed to cite law, but citations were not independently represented as verified authority.

### What changed

Added a legal-source registry with:

- jurisdiction;
- citation;
- source URL;
- authority;
- effective dates;
- verification date;
- verification status;
- notes.

AI responses explicitly use an `unverified` citation status where authoritative verification has not been established.

The system prompt prohibits invented statutes, cases, regulations and citations.

**Verification:** Deferred.

---

# 10. Jurisdiction safety

### Baseline flaw

Jurisdiction could be insufficiently enforced at the AI boundary.

### What changed

- Added explicit supported jurisdiction configuration.
- Current supported jurisdiction is **Nigeria**.
- Client supplies jurisdiction explicitly.
- Edge Function rejects missing jurisdiction.
- Edge Function rejects unsupported jurisdictions.
- Server-owned prompt states the jurisdiction explicitly.
- The AI is instructed not to silently infer/substitute another jurisdiction.

This is server-enforced rather than merely UI-enforced.

**Verification:** Deferred.

---

# 11. Terms / Privacy consent

### Baseline flaw

Terms/privacy acceptance needed stronger evidence of an actual consent event and version tracking.

### What changed

Registration now requires `accept_terms === true`.

Signup metadata records:

- acceptance state;
- Terms version;
- Privacy version.

A processing register and consent migration were added.

**Verification:** Deferred.

---

# 12. Authentication / account security

### Baseline flaw

Authentication and authorization boundaries needed stronger server-backed enforcement and some UI claims were unsupported.

### What changed

- Supabase Auth became the identity/session source of truth.
- Password minimum validation was added.
- Protected services require authenticated sessions.
- Privileged Supabase keys are not used by the mobile app.
- “Secured with Bio-Auth” was replaced with “Secured with Supabase Auth.”
- Logout/account switching was hardened.
- Auth session storage moved to SecureStore.

**Verification:** Deferred.

---

# 13. Document generator safety

### Baseline flaw

The consultation flow was mocked with `setTimeout`, while UI language suggested immediate authoritative/binding documents.

### What changed

- Removed the fake “AI Architect” success response.
- Added explicit template-selection validation.
- Real generator responses must be present before preview.
- Empty/invalid generation responses fail closed.
- AI instructions explicitly prohibit fabricated signatures, stamps, notarization, official approval, filing status, parties, facts, citations or legal validity.
- Missing required information must use placeholders.

**Verification:** Deferred.

---

# 14. Numerical risk / confidence scoring

### Baseline flaw

Risk/confidence scores could create false precision and appear to be legal determinations.

### What changed

- AI prompt prohibits numerical legal risk/confidence scores.
- Client strips risk/confidence fields from document-analysis payloads.
- Document analysis uses qualitative uncertainty.
- Regression checks specifically guard against reintroducing these fields.

**Verification:** Deferred.

---

# 15. Build / release integrity

### Baseline flaw

The release path contained stale configuration and lacked sufficiently deterministic checks.

### What changed

Added:

- `npm run typecheck`;
- `npm run doctor`;
- `npm run verify:release`;
- deterministic release-integrity script;
- duplicate-config detection;
- legacy endpoint detection;
- secret-name detection;
- EAS configuration checks;
- environment-file checks.

**Verification:** Deferred.

---

# 16. Chat persistence consistency

### Baseline flaw

Streaming/non-streaming persistence behavior was inconsistent and local/server history could diverge.

### What changed

- Authenticated persistence became the canonical server path.
- Conversation creation explicitly records `user_id`.
- User messages must successfully persist before AI processing proceeds.
- Assistant responses are persisted only after usable output exists.
- Chat history reads require authentication.
- Generic local chat caching was disabled.
- Incognito mode does not persist chat.

Streaming was also hardened to preserve incomplete SSE frames between network chunks.

**Verification:** Deferred.

---

# 17. Fail-closed error handling

### Baseline flaw

Some failures could be swallowed, converted into empty results, or represented as apparent success.

### What changed

The system now fails closed for:

- conversation creation failure;
- message persistence failure;
- invalid AI responses;
- incomplete AI streams;
- oversized AI output;
- unsupported OCR;
- unsupported authenticity verification;
- malformed document analysis;
- provider failures;
- unexpected gateway errors.

The client no longer silently converts important backend failures into empty successful-looking results.

**Verification:** Deferred.

---

# 18. Logging / observability

### Baseline flaw

Sensitive legal/user information could potentially reach logs, while security events were not clearly separated from content.

### What changed

- Added privacy-safe structured gateway security events.
- Added request correlation IDs internally.
- Avoided logging legal text, prompts, tokens, request bodies or provider responses.
- Expanded centralized client logger redaction for legal/personal fields.
- Routed known screen/voice errors through the centralized logger.

**Verification:** Deferred.

---

# 19. Secrets / configuration

### Baseline flaw

Configuration included stale backend paths and environment handling required stronger separation.

### What changed

- Deleted committed `mobile/.env`.
- Kept only public Supabase client configuration in `.env.example`.
- Removed legacy API URL fallback.
- Provider secrets remain server-side.
- Removed duplicate Expo configuration.
- Added npm configuration and release-integrity checks.

**Verification:** Deferred.

---

# 20. Dependency / supply-chain

### Baseline flaw

Unused/legacy dependencies increased attack surface and there was no explicit high-severity audit gate.

### What changed

- Removed unused `axios`.
- Removed unused `expo-web-browser`.
- Kept lockfile aligned.
- Added npm audit configuration.
- Added `npm audit --audit-level=high` to the security workflow.
- Added dependency-related regression checks.

**Verification:** Deferred.

---

# 21. Mobile platform privacy/security

### Baseline flaw

Mobile storage, permissions and network-security posture needed stronger hardening.

### What changed

- Supabase Auth sessions use SecureStore.
- SecureStore session values have bounded chunk handling.
- Corrupt/incomplete secure session state fails closed.
- Android cleartext network traffic is disabled.
- Camera/microphone/location permissions are explicitly declared.
- iOS purpose strings explain sensitive permissions.
- Voice-input errors use the redacting logger.
- Legal chat is not generically cached locally.

**Verification:** Deferred.

---

# 22. Human lawyer escalation

### Baseline flaw

The UI referenced escalation behavior without a complete authenticated persistence path; operational claims could exceed actual human-service guarantees.

### What changed

Added:

`legal_escalation_requests`

with:

- authenticated user ownership;
- conversation ownership validation;
- status lifecycle;
- urgency;
- timestamps;
- reference number;
- RLS;
- no client status modification/delete policy.

Added:

`chatService.escalateConversation()`

with authenticated submission and input validation.

### Critical operational boundary

A database row means **a request was submitted**. It does not mean a lawyer accepted, reviewed, or agreed to represent the user.

**Verification:** Deferred.

---

# 23. Security regression suite

### Baseline flaw

The remediation checklist required regression testing, but the baseline did not have an adequate automated regression layer.

### What changed

Added:

`mobile/scripts/security-regression.mjs`

and:

`npm run test:security`

It guards against regression of:

- legacy endpoints;
- secrets/config;
- insecure auth storage;
- gateway trust-boundary violations;
- stream completion errors;
- document fake-success paths;
- escalation RLS requirements;
- logging leaks;
- removed dependencies.

**Verification:** Deferred.

---

# 24. Formal threat model

### Baseline flaw

Security risks were documented as findings but lacked a unified formal threat model and abuse-case register.

### What changed

Added:

- `docs/THREAT_MODEL.md`
- `docs/ABUSE_CASE_REGISTER.md`

The threat model now identifies assets, trust boundaries, threats, controls and residual verification requirements.

The abuse register contains 20 explicit abuse cases covering authentication, RLS, AI injection, provider failure, documents, escalation, dependencies, release configuration and local storage.

**Verification:** Review/validation deferred.

---

# 25. Production governance

### Baseline flaw

The previous checklist established findings, but the release process needed a final evidence-driven governance gate.

### What changed

Added:

`docs/PRODUCTION_RELEASE_CHECKLIST.md`

It requires evidence for:

- architecture;
- Auth/RLS;
- AI gateway;
- privacy;
- documents;
- legal sources;
- jurisdiction;
- legal-product positioning;
- escalation;
- build/release;
- dependencies;
- mobile security;
- observability;
- threat model;
- production operations.

It also defines explicit **release-stop conditions**.

---

# Overall security posture change

## Before

The audited baseline had several critical trust-boundary problems:

**Client trust was too high → AI boundary was too permissive → authorization was insufficiently demonstrated → privacy claims exceeded evidence → legal authority could be overstated → document inputs were insufficiently isolated → persistence was inconsistent → release configuration could drift.**

## After remediation

The intended architecture is now:

**Untrusted mobile client**  
↓  
**Supabase Auth identity**  
↓  
**RLS-controlled private data**  
↓  
**Authenticated Edge Function**  
↓  
**Server-owned legal/AI policy**  
↓  
**Validated and bounded untrusted input**  
↓  
**Controlled AI provider**  
↓  
**Untrusted AI output validated before use**

With separate controls for:

- device isolation;
- document handling;
- legal-source integrity;
- jurisdiction;
- human escalation;
- logging;
- dependency security;
- release integrity;
- threat modeling;
- production governance.

---

# What has NOT yet been proven

This document deliberately does **not** say the system is production-secure yet.

The following still require actual evidence:

1. Live Supabase RLS deployment and adversarial cross-user testing.
2. Live Edge Function configuration and JWT behavior.
3. AI prompt-injection regression testing.
4. Dependency audit results.
5. TypeScript verification.
6. Expo Doctor verification.
7. Clean production build.
8. Clean-device testing.
9. SecureStore/device artifact inspection.
10. Real provider/log retention configuration.
11. Legal-source verification data.
12. Human-lawyer operational workflow.
13. Full end-to-end regression testing.
14. Final independent red-team review.

**Therefore the correct current status is:**

### 🟡 Remediation implemented / verification pending

Not “fully secure,” not “compliant,” and not “approved for trusted public release.”

---

# Audit trail

The original master issue remains the historical record of the baseline findings:

**Issue #1 — Security, Privacy & Legal-System Remediation**

The remediation branch and this document provide the corresponding **before → fix → resulting architecture → remaining verification** record.

This document is an engineering/security record, not a legal certification or compliance opinion.
