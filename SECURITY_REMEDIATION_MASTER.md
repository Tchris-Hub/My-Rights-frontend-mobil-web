# My Rights — Security & Legal-System Remediation Master Checklist

**Branch:** `security-hardening-v1`  
**Baseline:** `stitch-supabase-redesign` @ `ab1e62a141f5f26842639a20d266485a624f162f`  
**Status:** 🔴 NOT APPROVED FOR TRUSTED PUBLIC RELEASE

## Purpose

This document is the master release checklist created from the full red-team review of the My Rights mobile/web system. It is intentionally adversarial: every item must be verified, tested, and evidenced before release. Checking a box means the remediation is implemented **and tested**, not merely that code was changed.

> **Release rule:** No public production release while any Critical item remains open, untested, or unverifiable.

---

## P0 — CRITICAL / RELEASE BLOCKERS

### 1. Architecture and release-path integrity
- [ ] Define one canonical production architecture: Mobile → Supabase Auth → Supabase DB/Storage with RLS → Supabase Edge Functions → controlled AI gateway → approved AI provider.
- [ ] Remove/disable all stale Railway/Python production paths from the release build.
- [ ] Remove stale API URLs and legacy environment-variable fallbacks.
- [ ] Confirm exactly one Supabase client implementation and one production configuration path.
- [ ] Identify one immutable release commit and document it.
- [ ] Verify production/mobile/web builds use the intended Supabase project and environment.
- [ ] Add CI checks that fail on forbidden legacy endpoints/configuration.

### 2. AI gateway trust boundary
- [ ] Never trust a client-supplied `system` message.
- [ ] Reject or strip client messages with privileged/system roles.
- [ ] Make system/developer instructions server-owned and immutable to clients.
- [ ] Enforce authenticated/guest access policy at the server boundary.
- [ ] Validate request schema and message roles server-side.
- [ ] Add request-size, message-count, token-budget, timeout and concurrency limits.
- [ ] Add abuse/rate limiting with per-user and/or per-IP controls appropriate to privacy requirements.
- [ ] Prevent arbitrary model/provider selection from the client.
- [ ] Keep provider credentials exclusively server-side.
- [ ] Validate and sanitize AI output before it reaches privileged application actions.
- [ ] Add structured response schemas for legal-analysis outputs.
- [ ] Add prompt-injection regression tests, including hostile system-role attempts.

### 3. Supabase authorization / RLS
- [ ] Produce a complete RLS policy inventory for every table.
- [ ] Verify `users` isolation.
- [ ] Verify `chat_sessions` ownership isolation.
- [ ] Verify `chat_messages` ownership through the parent session.
- [ ] Verify documents and document-analysis records are owner-isolated.
- [ ] Verify private storage buckets and object paths are owner-isolated.
- [ ] Verify lawyer/legal-aid private operational data is not exposed to unauthorized users.
- [ ] Verify escalation records are access-controlled.
- [ ] Verify RPCs/functions cannot bypass intended authorization.
- [ ] Test user A against user B for SELECT/INSERT/UPDATE/DELETE.
- [ ] Test unauthenticated/anon access against every private resource.
- [ ] Test IDOR-style access using guessed/modified UUIDs.
- [ ] Confirm service-role credentials never ship in the client.
- [ ] Document and test least-privilege policies.

### 4. Sensitive legal data and privacy claims
- [ ] Map every location where legal conversations, uploaded documents, identity data and metadata are stored or transmitted.
- [ ] Reconcile the privacy policy with the actual AI data flow.
- [ ] Do not claim that no identifiers are sent to an AI provider unless the implementation demonstrably strips them.
- [ ] Do not claim “Zero-Trace” unless provider retention, application logs, analytics, crash logs and server logs are covered by a documented design and verified configuration.
- [ ] Replace unsupported “Incognito • Zero-Trace” wording with an accurate privacy-session description unless true zero-retention can be proven.
- [ ] Define retention periods for chats, documents, logs and escalations.
- [ ] Implement deletion/export/account-data controls that match the privacy policy.
- [ ] Ensure deletion actually removes or expires all relevant copies and caches.
- [ ] Review third-party processors and data-transfer disclosures.
- [ ] Add a documented incident/breach response path.

### 5. Local data isolation and logout
- [ ] Inventory all AsyncStorage/local persistence containing legal or account-specific information.
- [ ] Clear cached conversations on logout/account switch.
- [ ] Clear saved documents and temporary analysis results where applicable.
- [ ] Clear active-user/profile state.
- [ ] Ensure user B cannot see user A's cached legal material after logout/login.
- [ ] Add automated account-switch regression tests.
- [ ] Review screenshots, notifications, deep links and background state for accidental disclosure.

### 6. Legal-product positioning and reliance risk
- [ ] Remove or substantiate “EDITORIAL AUTHORITY” claims.
- [ ] Remove or substantiate “LEGAL PRECISION” claims.
- [ ] Remove/qualify “binding documents instantly.”
- [ ] Review “Legal Agent,” “AI verified,” “THE PLAIN TRUTH,” “LEGAL STANDING,” and similar authority/reliance language.
- [ ] Clearly distinguish AI-generated information from advice/representation by a licensed lawyer.
- [ ] Add contextual warnings where users could reasonably rely on an output to make a legal decision.
- [ ] Define the exact scope of the product in each supported jurisdiction.
- [ ] Do not imply lawyer-client representation unless a real engagement has occurred.
- [ ] Ensure emergency/high-risk legal situations have appropriate human escalation messaging.

### 7. Lawyer/legal-aid directory integrity
- [ ] Remove default fabricated review counts (e.g. 50/100) when source data is absent.
- [ ] Remove “Verified Partner” unless an actual verification relationship exists.
- [ ] Remove “Highly Recommended” unless there is a documented, defensible basis and the wording is appropriate.
- [ ] Store verification source and last-verified date.
- [ ] Define how lawyer licence/practising status is verified and refreshed.
- [ ] Do not derive verification from ratings.
- [ ] Clearly identify listings that are informational versus formally partnered.
- [ ] Define complaints, correction and removal procedures.

### 8. Document analysis and malicious-file handling
- [ ] Treat every uploaded document as untrusted input.
- [ ] Validate file type, extension, MIME type and size.
- [ ] Add appropriate malware/security scanning before processing where applicable.
- [ ] Isolate document extraction from application instructions.
- [ ] Defend against indirect prompt injection contained inside PDFs/images/text.
- [ ] Prevent extracted document instructions from becoming privileged AI instructions.
- [ ] Validate OCR/extraction output before passing to the model.
- [ ] Limit processing cost and resource consumption per document.
- [ ] Prevent document content from causing unauthorized application actions.
- [ ] Add adversarial document test fixtures.

### 9. AI legal citations and source integrity
- [ ] Do not rely solely on the model's claim that a legal authority exists.
- [ ] Build an authoritative legal-source strategy per jurisdiction.
- [ ] Validate cited statutes/cases/regulations before presenting them as authorities where feasible.
- [ ] Record source title, jurisdiction, effective date/version and retrieval metadata.
- [ ] Detect unsupported/fabricated citations.
- [ ] Add regression tests for hallucinated authorities.
- [ ] Make uncertainty visible instead of manufacturing confidence.

### 10. Jurisdiction safety
- [ ] Require explicit jurisdiction/country for legal analysis where necessary.
- [ ] Do not silently assume Nigerian law for a user in another jurisdiction.
- [ ] Separate legal-source/retrieval policies by jurisdiction.
- [ ] Clearly display the jurisdiction used for an answer.
- [ ] Define unsupported-jurisdiction behavior.
- [ ] Test cross-jurisdiction prompts such as Nigeria/Qatar/UK/EU/US.

### 11. Terms of Service / Privacy consent
- [ ] Implement an actual explicit acceptance interaction before account creation where consent is required.
- [ ] Record terms version, privacy version, timestamp and user/account identifier as appropriate.
- [ ] Make Terms and Privacy links functional from Settings.
- [ ] Ensure policy text matches actual product behavior.
- [ ] Define re-consent behavior after material policy changes.

### 12. Account security and authentication
- [ ] Verify Supabase Auth configuration for production.
- [ ] Review password/session/token handling.
- [ ] Ensure authorization is server-enforced rather than UI-enforced.
- [ ] Review guest-mode privileges and conversion to registered accounts.
- [ ] Verify biometric claims only if biometric enforcement is actually implemented.
- [ ] Remove “Secured with Bio-Auth” if not technically true.

### 13. Document generator safety
- [ ] Replace mocked consultation flow with a clearly labeled template/drafting workflow or a real controlled AI workflow.
- [ ] Remove claims that generated documents are automatically binding.
- [ ] Clearly label drafts and templates.
- [ ] Require user review before finalization.
- [ ] Define jurisdiction and document type before generation.
- [ ] Add professional-review guidance for consequential documents.
- [ ] Test generated documents for missing parties, clauses, signatures, dates and jurisdiction-specific requirements.

### 14. Numerical risk/confidence scoring
- [ ] Define exactly what `risk_score` and `confidence_score` mean.
- [ ] Remove numerical scores if they cannot be empirically calibrated and explained.
- [ ] Never present a model score as a legal determination.
- [ ] Add human-review safeguards for outputs that could materially affect legal decisions.
- [ ] Test for misleading certainty and edge cases.

### 15. Build and release integrity
- [ ] Run `npx tsc --noEmit` from the exact release branch and resolve all real errors.
- [ ] Run `npx expo-doctor` and resolve release-relevant findings.
- [ ] Produce a clean EAS/production Android build.
- [ ] Exercise the release APK on a clean device/account.
- [ ] Test auth, chat, history, documents, directory, escalation, settings and logout end-to-end.
- [ ] Confirm no stale API calls occur during normal or failure paths.
- [ ] Capture and archive build/version/config evidence.

---

## P1 — HIGH RISK / MUST COMPLETE BEFORE TRUSTED PUBLIC BETA

### 16. Chat persistence consistency
- [ ] Unify streaming and non-streaming persistence paths.
- [ ] Ensure `conversation_id` is consistently created/updated.
- [ ] Ensure UI history exactly matches server history.
- [ ] Test reconnects, retries, duplicate sends and partial streams.

### 17. Error handling and fail-closed behavior
- [ ] Ensure AI/provider failures do not expose secrets or internal prompts.
- [ ] Ensure authorization failures fail closed.
- [ ] Ensure partial document processing cannot leak data.
- [ ] Ensure retry logic cannot multiply charges or duplicate legal actions.

### 18. Logging and observability
- [ ] Inventory logs containing prompts, documents, identifiers, tokens or legal content.
- [ ] Redact sensitive data from logs.
- [ ] Define security/audit events separately from content logs.
- [ ] Establish alerting for abuse, auth anomalies and provider failures.
- [ ] Ensure analytics do not accidentally capture legal content.

### 19. Secrets and configuration
- [ ] Confirm all provider secrets are server-side only.
- [ ] Scan repository history/configuration for accidental secrets.
- [ ] Rotate any credential that may have been exposed.
- [ ] Separate development/staging/production credentials.
- [ ] Document secret ownership and rotation procedure.

### 20. Third-party dependency and supply-chain review
- [ ] Audit production dependencies.
- [ ] Remove unused/legacy packages where practical.
- [ ] Review native modules and permissions.
- [ ] Pin/lock versions appropriately.
- [ ] Establish dependency update/security monitoring.

### 21. Mobile privacy/security
- [ ] Review Android permissions and remove unnecessary permissions.
- [ ] Review clipboard, screenshots, notifications and recent-apps exposure for legal data.
- [ ] Review deep links/universal links for authorization bypass.
- [ ] Review backup behavior for local legal data.
- [ ] Review debug logging in release builds.

### 22. Human lawyer escalation
- [ ] Define who receives an escalation.
- [ ] Define jurisdiction/licensing requirements.
- [ ] Define conflict-check process.
- [ ] Define whether/when representation begins.
- [ ] Define response expectations/SLA.
- [ ] Define fees and payment handling if applicable.
- [ ] Define what happens if no lawyer accepts the request.
- [ ] Ensure “a legal professional will contact you” is operationally true before publishing the promise.

---

## P2 — HARDENING / POST-BETA

### 23. Security testing
- [ ] Add unit tests for authorization helpers.
- [ ] Add RLS integration tests.
- [ ] Add AI prompt-injection tests.
- [ ] Add document injection tests.
- [ ] Add API fuzz/validation tests.
- [ ] Add rate-limit tests.
- [ ] Add account-isolation tests.
- [ ] Add regression tests for every previously discovered flaw.

### 24. Formal threat model
- [ ] Document assets, actors, trust boundaries and abuse cases.
- [ ] Threat-model client, Supabase, Edge Functions, AI gateway, providers and human escalation.
- [ ] Track residual risk after each mitigation.

### 25. Production governance
- [ ] Define incident response.
- [ ] Define data-subject request workflow.
- [ ] Define model/provider change-control process.
- [ ] Define legal-source update process.
- [ ] Define release approval criteria.
- [ ] Define rollback procedure.

---

## Previously Observed Code/UX Findings To Re-Verify

These were observed during the review and must not be forgotten even if they appear to be fixed later:

- [ ] Client-controlled `system` role in the AI message pipeline.
- [ ] Wildcard CORS on the AI Edge Function; determine whether it is necessary and constrain where possible.
- [ ] Missing visible server-side auth/authorization checks in the reviewed Edge Function source; verify deployed gateway policy.
- [ ] No visible request-size/rate/token controls in the reviewed Edge Function source.
- [ ] Privacy policy says identifiers are not sent to OpenRouter/NVIDIA; verify against actual implementation.
- [ ] “Incognito • Zero-Trace” UI claim exceeds demonstrated implementation.
- [ ] Logout did not clearly clear chat/local legal cache.
- [ ] Settings Terms/Privacy/Support controls appeared non-functional in reviewed code.
- [ ] Signup acceptance was represented programmatically but explicit UI consent needed verification.
- [ ] Lawyer/legal-aid defaults can fabricate reviews/verification labels.
- [ ] Document generator consultation step was mocked with `setTimeout`.
- [ ] Document generator UI claimed “binding documents instantly.”
- [ ] AI/legal risk-score and confidence-score presentation can create false precision.
- [ ] Jurisdiction was not enforced strongly enough at the AI boundary.
- [ ] AI citations were requested by prompt but not independently validated in the reviewed path.
- [ ] “Secured with Bio-Auth” required implementation verification.
- [ ] “Verified Member” and profile metrics required verification against real account data.
- [ ] Streaming/non-streaming chat persistence APIs appeared inconsistent.
- [ ] `ts_errors.txt` / `clean_errors.txt` contained TypeScript errors; determine whether stale or current by running the compiler on the exact release branch.
- [ ] Stale Railway URL/legacy backend configuration remained in the Supabase branch.

---

## Definition of Done

The system may move toward trusted public release only when:

1. **All P0 checkboxes are complete.**
2. Every P0 item has a test or other concrete verification evidence.
3. RLS isolation has been adversarially tested with multiple accounts.
4. AI gateway trust boundaries have been adversarially tested.
5. Privacy claims match actual data flows.
6. Legal authority/citation behavior has been tested against hallucination and prompt injection.
7. Lawyer/legal-aid listings contain only defensible verification and reputation data.
8. The exact release build passes type/build/health checks.
9. No known Critical issue is merely marked “accepted” without explicit risk review.
10. A fresh red-team pass finds no unresolved Critical release blocker.

## Severity rule

**Critical:** Can expose private legal data, bypass authorization, compromise provider credentials, materially mislead users about legal authority/representation, or create a serious unsafe legal-action pathway. Blocks release.

**High:** Significant security, privacy, integrity or operational weakness that should be fixed before trusted public beta.

**Medium/Low:** Hardening items tracked for continued improvement; they do not override unresolved Critical/High issues.

---

## Audit provenance

This checklist reflects findings from the My Rights red-team review of the repository architecture and implementation discussed in the current engineering review. It is a working engineering/security document, not a legal opinion or certification of compliance.
