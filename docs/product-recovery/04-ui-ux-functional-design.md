# 04 — Functional UI/UX Design

## Principle

The app must stop looking more complete than it actually is.

Design priority:
functionality → clarity → consistency → polish.

## Information architecture

Home
├── Ask
├── Check
├── Read
├── Create
├── Find Help
└── Recent Activity

Secondary:
Profile
Saved Rights
Chat History
Documents
Settings
Support

## Home

Primary message:
"Understand Nigerian law. Know your next step."

Primary action:
"What legal issue are you dealing with?"

Quick actions:
- Ask a question
- Review a document
- Read the Constitution
- Find legal help
- Create a document

Recent activity should show actual server-backed history.

## AI answer

Use a consistent order:
1. answer
2. legal context
3. source-backed explanation
4. sources
5. possible next steps
6. when human help is appropriate

For recent-law research:
"Current-source research was used because the local legal library did not contain sufficient recent material."

Source card:
- official indicator
- publisher
- title
- publication/effective date
- retrieved time
- supporting excerpt
- open source

## Constitution

Search:
"What right or provision are you looking for?"

Popular rights:
- fundamental rights
- fair hearing
- expression
- privacy
- property
- movement

Section view:
- exact official text
- plain-language explanation
- related provisions
- source
- save
- ask AI

A saved Constitution section must reopen from stored data, not regenerate the text from AI.

## Saved Rights

List:
- title
- provision
- source
- saved date

Detail:
- exact source text
- source/provenance
- user notes
- related law
- Ask Digital Jurist

## Document Review

### Intake

Review a document

Upload PDF
Upload DOCX
Upload TXT
Scan with camera
Choose image
Paste text

### File confirmation

Display:
- filename
- type
- size
- page count where available
- extraction status

### Processing

Use real progress states:
- reading file
- extracting text
- normalizing content
- identifying clauses
- retrieving legal context
- preparing review

Do not use timed fake progress labels where the server is not actually doing those operations.

### Results

Header:
Document type
Overall assessment
Summary

Clause groups:
- High attention
- Medium attention
- Informational

Clause detail:
- exact clause
- simplified explanation
- legal principle
- potential consequence
- questions to ask
- possible next step
- supporting source where available

Actions:
- save review
- export
- new review
- ask about clause

No unsupported numeric legal risk or confidence score.

## Document Architect

Step 1 — Choose document
Step 2 — Enter facts
Step 3 — AI clarification
Step 4 — Draft
Step 5 — Review
Step 6 — Export

The clarification stage must either actually call AI or be honestly labelled a requirement form. Target design calls AI.

## Legal discovery

Search:
"What kind of legal help do you need?"

Filters:
- practice area
- location
- remote/in-person
- availability
- fee range
- language
- verification
- lawyer/firm

Profile card:
- verification
- name
- title
- practice areas
- location
- experience
- availability
- fee band
- bio
- contact/request

Explain discovery:
"Shown because this professional lists property matters in Abuja and offers remote consultations."

## Professional onboarding

One application can support multiple roles.

Choose:
- practising lawyer
- law firm/chambers
- law student / emerging professional

Practising lawyer:
credentials + status verification before public listing.

Law student:
separate badge and permissions; never presented as a lawyer.

## Settings

Every visible item must work.

Privacy:
- privacy policy
- data use
- export data
- deletion request
- third-party processing

Security:
- session
- sign out
- account recovery

Support:
- support
- report problem
- report professional
- report incorrect legal information

Terms:
- current version

## Error states

Tell the user what failed and what they can do.

Bad:
"Something went wrong."

Better:
"Your PDF was selected successfully, but text extraction failed. Try another file, scan the document as an image, or paste its text."

## Empty states

Distinguish:
- genuinely empty user data
- loading
- unavailable service
- missing data
- unavailable feature

## Typography and layout recovery

Reported UI problems:
- text misalignment
- overflow
- inconsistent spacing
- awkward wrapping

Rules:
- one shared type scale
- one spacing scale
- constrained headings
- natural wrapping
- no hard-coded line assumptions
- long-name tests
- long-citation tests
- small-screen Android tests
- large accessibility font tests
- consistent card/radius system

## Accessibility

Minimum:
- labels for icon-only controls
- usable touch targets
- readable contrast
- screen-reader labels
- dynamic text without clipping
- selectable legal/source text

## Trust signals

Good:
"Official source"
"Verified 25 Sep 2026"
"Retrieved 2 minutes ago"

Avoid unsupported:
"Highly Recommended"
"AI Verified"
"Best Lawyer"
"Guaranteed"
"Highest win rate"

Trust is shown through evidence and provenance, not decorative claims.
