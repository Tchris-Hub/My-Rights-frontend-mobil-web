# 05 — Phased Implementation Program

## Operating rule

We proceed phase-by-phase. A phase cannot be closed because code changed or typecheck passed. It closes only when its acceptance evidence is green.

## Phase 0 — Baseline and inventory

Goal:
Create a canonical matrix of screens, actions, API calls, backend routes, data, providers and known regressions.

Deliverables:
- feature matrix
- API contract matrix
- data population matrix
- provider configuration matrix
- old-vs-current recovery notes

Exit:
Every major capability is labelled Working / Partial / Broken / Missing / Placeholder.

## Phase 1 — Legal data restoration

Goal:
Make legal data real and reproducible.

Tasks:
- Constitution import/seed
- source metadata
- legal templates seed
- legal-aid data
- lawyer/firms data
- verification metadata
- idempotent import
- corpus integrity tests

Exit:
A clean database receives baseline content reproducibly.

## Phase 2 — API contract reconciliation

Goal:
Eliminate frontend/backend drift.

Canonical contracts:
- user
- conversation
- message
- citation
- research result
- document analysis
- document generation
- legal source
- lawyer
- firm
- legal aid
- escalation

Exit:
No production screen relies on fields the backend does not supply.

## Phase 3 — Living legal research

Goal:
Make AI current-law capable.

Tasks:
- research provider abstraction
- server-side search/fetch
- official source allowlist
- freshness router
- source normalization
- provenance
- version/supersession
- conflict handling
- evidence ledger
- DeepSeek synthesis boundary
- current-law citations
- provider health tests

Exit:
A query about a new law that is absent from the local corpus triggers research and returns evidence-backed citations.

## Phase 4 — Document ingestion recovery

Goal:
Restore the practical document workflow from earlier versions.

Tasks:
- PDF
- DOCX
- TXT
- image
- camera
- secure validation
- extraction
- OCR/vision
- normalized text
- preview

Exit:
Each supported file type reaches the same analysis pipeline.

## Phase 5 — Document analysis UX

Goal:
Restore rich document intelligence UX without unsafe scoring.

Tasks:
- summary
- attention grouping
- clause cards
- detailed clause analysis
- source links
- save
- export
- ask-about-clause
- real progress state

Exit:
Clean-device document review works end-to-end.

## Phase 6 — Constitution and legal library

Goal:
Turn the legal corpus into a core product feature.

Tasks:
- source links
- version metadata
- search
- exact section pages
- related provisions
- save citation
- Saved Rights
- ask AI
- source-to-answer deep links

Exit:
Every saved legal right reopens its exact source.

## Phase 7 — Chat and citations

Goal:
Make the core AI experience trustworthy and persistent.

Tasks:
- conversation summary contract
- true message counts
- history
- delete/resume
- citation contract
- official-source open
- research freshness labels
- source-to-answer relationship

Exit:
User can follow answer → source → exact provision and return to conversation.

## Phase 8 — Human legal assistance

Goal:
Connect self-service to real legal professionals.

Tasks:
- directory
- profile
- verification
- contact
- availability
- intake
- escalation
- request status
- reports

Exit:
Client can reach a real verified or explicitly unverified professional listing with honest status.

## Phase 9 — Professional portal

Goal:
Build the second side of the platform.

Tasks:
- role selection
- professional application
- verification
- public profile
- firm profile
- availability
- fee bands
- opportunities
- inbox
- compliance

Exit:
A verified practising lawyer can maintain a public profile and receive controlled enquiries.

## Phase 10 — Matching

Goal:
Make legal-help discovery useful.

Inputs:
- legal topic
- jurisdiction
- location
- urgency
- service mode
- language
- budget
- availability

Output:
Explainable set of compatible professionals.

Exit:
Natural-language request → understandable discovery result.

## Phase 11 — Profile, settings and saved rights

Goal:
Remove the "finished-looking placeholder" problem.

Tasks:
- actual statistics
- Saved Rights
- privacy center
- support
- account controls
- data requests
- report flows

Exit:
Every visible interaction has a real outcome.

## Phase 12 — UI cleanup

Goal:
Polish after functional stability.

Tasks:
- spacing
- alignment
- text overflow
- typography
- dark mode
- accessibility
- small screens
- long content
- loading/error/empty states

Exit:
Visual QA passes on supported Android form factors.

## Phase 13 — Observability and E2E

Goal:
Detect regressions automatically.

Tests:
- auth
- consent
- chat
- stream
- research
- citations
- document extraction
- image analysis
- generation
- Constitution
- Saved Rights
- discovery
- professional onboarding
- escalation
- logout/isolation

Safe telemetry:
- request ID
- route
- latency
- error class
- provider status
- source count
- freshness state

Never log API keys, auth cookies or unnecessary raw legal documents.

## Phase 14 — Release gate

Must pass:
- TypeScript
- unit tests
- contract tests
- integration tests
- clean-device Android tests
- Google and magic-link auth
- consent
- AI chat
- live research
- Constitution
- PDF/DOCX/TXT
- image workflow
- generation
- legal discovery
- professional onboarding
- logout/account isolation
- accessibility smoke tests

## Dependency order

0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14

Parallel work is allowed only when dependencies are already stable.

## Engineering vs external dependencies

Engineering-controlled:
- app
- API
- data model
- research layer
- provider adapters
- document pipeline
- UI
- tests
- observability
- professional portal
- matching

External:
- provider credentials
- search-provider account
- authoritative source availability
- actual professional credential verification
- payments/communications accounts
- final regulatory/privacy review

Do not mark external dependencies complete because a mock UI exists.

## Whole-platform definition of done

Client:
Ask → verify → save → act → find human help

Professional:
Join → verify → profile → receive enquiry → communicate → manage

Admin:
Verify → curate → monitor → correct → suspend → audit
