# My Rights — Product Recovery & Platform Research

Status: Research baseline for the functionality-recovery program
Repository: 7-labs-corp/My-Rights-frontend-mobil-web
Implementation branch: sdk57-upgrade
Backend: Tchris-Hub/alpha01
Research date: 2026-09-25

## Mission

Return My Rights to a coherent, production-grade Nigerian legal-information platform without rolling back the security hardening already completed.

My Rights should be treated as a two-sided legal-access platform:

1. People who need legal information, document help, legal-aid discovery, or a route to a human practitioner.
2. Verified legal professionals and firms who want a professional presence and a controlled way to receive appropriate client enquiries.

A third operational role is required: administrators who verify professionals, curate legal sources, resolve reports, and operate safety controls.

## Design doctrine

- Functionality before visual polish.
- Every visible action must have a real outcome or be clearly labelled unavailable.
- Frontend types, API responses, and database models must describe the same contract.
- HTTP 200 is not feature success. Content and user-visible behavior must also be verified.
- AI generation is synthesis. Legal research and retrieval are separate subsystems.
- Current law must be freshness-aware.
- Authoritative sources must be cited and provenance recorded.
- No credential, review, success-rate, pricing, or verification claim may be invented.
- Do not expose a law student as a practising lawyer.
- Keep security boundaries unless a documented product requirement justifies change.
- No phase is complete because code compiles. A user journey and its underlying contract must pass acceptance tests.

## Forensic conclusion

The project is recoverable. The principal problem is architectural drift after the Supabase-to-Neon/Prisma/Better Auth migration and concurrent security hardening.

The system currently contains:
- living backend routes,
- partial database models,
- UI from several generations,
- old assumptions about API fields,
- missing data population workflows,
- deliberately removed unsafe behaviors,
- unfinished features that still look finished.

The recovery target is not a rewrite. It is a controlled reconciliation of:
Mobile → API → database/provider → response → UI.

## Major findings already established

### Authentication
Authentication is operational in production after the recent navigation repair.

### AI
The current backend has a real DeepSeek integration and legal grounding against database content. It does not yet have a live research layer for novel/current legal questions.

### Constitution
The current app has a database-backed Constitution browser and search endpoint, but no obvious reproducible corpus import/seed mechanism was found in the backend repository. A 200 response can therefore still be an empty legal library.

### Documents
Current image analysis works through a binary image endpoint and DeepSeek vision. Current text extraction is explicitly unavailable in the mobile document service, so PDF/DOCX/TXT ingestion has regressed from an earlier version.

### Document UI
The older document workflow had PDF/DOCX/TXT import, extraction/OCR, a richer analysis display, a risk gauge, clause cards, and deep analysis. The unsafe numerical risk/confidence claims must not be restored; the useful interaction structure should be.

### Chat history
Current mobile history expects fields that current backend history does not return consistently.

### Citations
Current backend grounding and current mobile citation display use different field shapes, and the source-opening interaction is a no-op.

### Legal discovery
Current lawyer/legal-aid screens contain verification/recommendation/contact presentations that are not consistently backed by reliable data.

### Profile/settings
Some statistics are hard-coded and several interactions are visually present but functionally empty.

### Document Architect
The "consultation" stage currently records a local acknowledgement rather than making an AI call. The final generation call is real.

## Target product loop

Client:
Home → Ask / Check / Read / Create / Find Help
→ evidence-backed answer
→ self-service or human handoff

Professional:
Join → verify → build profile → receive appropriate enquiries → communicate → manage work

Admin:
Verify → curate → monitor → correct → suspend → audit

## Phase rule

The implementation must move in order and stop at each gate. Fixing a later screen does not close an earlier broken contract.

See:
- 01-current-state-forensic-inventory.md
- 02-ai-research-and-knowledge-architecture.md
- 03-two-sided-legal-marketplace.md
- 04-ui-ux-functional-design.md
- 05-phased-implementation-program.md
- 06-acceptance-test-matrix.md

## Research anchors

Federal Ministry of Justice:
https://justice.gov.ng/

National Assembly legislation and Acts:
https://www.nass.gov.ng/documents/magazine

Example current Act publication:
https://nass.gov.ng/documents/download/11248

Nigeria Data Protection Commission:
https://www.ndpc.gov.ng/ndp-act-2023/

NDP Act-GAID 2025:
https://ndpc.gov.ng/wp-content/uploads/2025/03/NDP-ACT-GAID-2025-MARCH-20TH.pdf

NBA practising-fee / practice-status information:
https://blog.nigerianbar.org.ng/2026/01/02/commencement-of-2026-bar-practising-fee-bpf/

NBA practice/CPD information:
https://blog.nigerianbar.org.ng/2025/06/20/setting-the-record-straight-on-mandatory-cpd-requirement-and-the-right-to-practice-law/

NBA Section on Legal Practice national law-firm directory:
https://lfd.nbaslp.org/

Current Nigerian legal-marketplace references:
https://obaor.org/
https://directory.lawyard.org/
https://legalpediaonline.com/
