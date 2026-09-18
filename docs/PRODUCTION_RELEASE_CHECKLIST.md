# My Rights — Production Governance & Release Checklist

**Branch:** `security-hardening-v1`

**Current state:** Remediation implementation is complete through the locked sequence. Verification is intentionally deferred until the verification window is available.

## Release gate

A production release is blocked until all required verification evidence is present. Source changes alone are not sufficient.

### 1. Architecture / release path
- [ ] Single mobile Expo config is authoritative.
- [ ] No legacy backend/API fallback.
- [ ] No client-bundled provider or service-role secret.
- [ ] Release-integrity script passes.

### 2. Authentication / authorization
- [ ] Supabase Auth is the identity/session source of truth.
- [ ] Protected services require authenticated sessions.
- [ ] Account switching clears prior user-scoped data.
- [ ] Cross-user access tests fail closed.

### 3. Postgres / Storage
- [ ] RLS migration is deployed.
- [ ] RLS adversarial tests pass for users, chats, documents/storage, and escalation requests.
- [ ] Storage object ownership is verified.

### 4. AI gateway
- [ ] Edge Function JWT verification is enabled.
- [ ] Server-owned prompts and provider credentials are confirmed.
- [ ] CORS, method, size, message-count, jurisdiction, and rate limits pass tests.
- [ ] Provider failure paths are sanitized.

### 5. AI input/output
- [ ] Prompt-injection corpus passes.
- [ ] Malformed/oversized output is rejected.
- [ ] Truncated streams are not treated as successful responses.
- [ ] Untrusted document content remains data, not instructions.

### 6. Privacy / sensitive data
- [ ] Privacy processing register matches deployed behavior.
- [ ] Terms/privacy versions are current.
- [ ] Provider retention and subprocessors are documented from authoritative contracts/settings.
- [ ] Deletion/retention behavior is runtime-tested.

### 7. Device isolation
- [ ] Auth session is stored in SecureStore.
- [ ] No generic chat/legal cache remains.
- [ ] Logout and account switching leave no prohibited user-scoped artifacts.

### 8. Documents
- [ ] File type/size checks pass.
- [ ] Malicious document corpus passes.
- [ ] Binary parsing is isolated from privileged execution paths.
- [ ] Unsupported OCR/authenticity features fail closed.

### 9. Legal sources / citations
- [ ] Source registry effective dates and verification states are populated from authoritative sources.
- [ ] Unverified citations are visibly unverified.
- [ ] Source freshness/versioning tests pass.

### 10. Jurisdiction
- [ ] Nigeria-only jurisdiction enforcement passes direct API tests.
- [ ] Missing/unsupported jurisdiction is rejected.
- [ ] UI cannot bypass server enforcement.

### 11. Legal reliance
- [ ] No advice/representation claims remain.
- [ ] No outcome prediction or numerical legal-confidence claims remain.
- [ ] High-stakes matters route users toward qualified human/official resources.

### 12. Human escalation
- [ ] Escalation queue RLS passes.
- [ ] Reference numbers are unique.
- [ ] Client cannot self-accept/close/modify requests.
- [ ] Human provider workflow and notification process are documented before launch claims are made.

### 13. Document generation
- [ ] Generated output is labeled as draft/general information.
- [ ] Missing facts use placeholders rather than fabricated values.
- [ ] No fake signatures/stamps/notarization/filing status.
- [ ] Export path preserves required warnings.

### 14. Risk/confidence governance
- [ ] No unsupported numerical legal-risk/confidence score is presented.
- [ ] Regression tests confirm qualitative uncertainty wording.

### 15. Build / release integrity
- [ ] TypeScript passes.
- [ ] Expo Doctor passes.
- [ ] Release integrity passes.
- [ ] Final artifacts are inspected for secrets and legacy endpoints.

### 16. Chat persistence
- [ ] Authenticated persistence is consistent.
- [ ] Incognito mode does not write chat history.
- [ ] Failed assistant persistence is surfaced as failure.

### 17. Fail-closed behavior
- [ ] Provider/network/DB/parse failures do not fabricate success.
- [ ] Incomplete streams fail closed.
- [ ] Unsupported features fail closed.

### 18. Observability
- [ ] Security events are emitted for important failures.
- [ ] Legal content, prompts, tokens, and provider responses are absent from logs.
- [ ] Production log access and retention are documented.

### 19. Secrets/configuration
- [ ] Secret scan is clean.
- [ ] CI secrets are supplied through secret storage, not repository files.
- [ ] Only intended public configuration reaches the mobile bundle.

### 20. Dependencies
- [ ] `npm ci` succeeds.
- [ ] `npm audit --audit-level=high` passes.
- [ ] Dependency provenance/signatures are reviewed where available.
- [ ] Lockfile is committed and matches `package.json`.

### 21. Mobile platform security
- [ ] Permission set is minimal and expected.
- [ ] Cleartext network traffic is disabled.
- [ ] SecureStore auth round-trip works on supported devices.
- [ ] Temporary files are cleaned up.

### 22. Human-service operations
- [ ] Provider onboarding/verification process exists.
- [ ] Escalation acceptance/decline/closure ownership is defined.
- [ ] Notification and response expectations are documented.
- [ ] User-facing claims match actual service availability.

### 23. Security regression suite
- [ ] Static security regression suite passes.
- [ ] Runtime/API/RLS/device regression suites pass.
- [ ] Adversarial corpus results are archived as release evidence.

### 24. Threat model
- [ ] Threat model reviewed.
- [ ] Abuse-case register reviewed.
- [ ] New material threats from the current release are added before approval.

### 25. Governance
- [ ] All task status records are current.
- [ ] Verification evidence is linked to the corresponding task.
- [ ] Critical findings are resolved or explicitly blocked from release.
- [ ] Release owner signs off on architecture, security, privacy, legal-product, and operational gates.
- [ ] Post-release monitoring/incident process is documented.

## Mandatory release-stop conditions

Do not ship if any of the following is true:
- a critical security test is unverified;
- RLS ownership cannot be demonstrated;
- a provider/service secret is present in the client artifact;
- an AI response can be presented as authoritative legal advice without the required safeguards;
- incomplete provider output can be stored/displayed as a successful answer;
- a human escalation can be represented as lawyer acceptance without evidence;
- privacy/security claims exceed the behavior that has actually been verified.

## Evidence rule

Every checked box must point to reproducible evidence: command output, test report, deployment configuration, artifact inspection, or authoritative operational record. A source-code change alone is not evidence that a deployed control works.
