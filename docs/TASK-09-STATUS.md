# Task 09 — Legal Source / Citation / Effective-Date Integrity

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Added a curated legal_sources registry with jurisdiction, source type, citation, URL, issuing authority, effective dates, verification timestamp/status and notes.
- Enabled RLS so mobile clients can read only sources explicitly marked verified; there are no client write policies.
- Hardened the AI gateway so it must not invent statutes, cases, regulations or citations and must disclose when authoritative source verification is unavailable.
- Added explicit jurisdiction input to the gateway. When absent, the server tells the model not to assume Nigerian or any other jurisdiction.
- Added a machine-readable citation_status: unverified marker to the current AI response contract so the app cannot silently treat model prose as verified legal research.
- Kept the source registry separate from AI-generated text so source authority is a data/governance property rather than a model claim.

## Important limitation

The current gateway does not yet retrieve and inject verified source records into every answer. Therefore AI answers are not represented as citation-verified legal research. A later implementation can add a controlled retrieval layer using only verified registry records.

## External fact-check

Nigeria's available legal-source ecosystem is not a single static database: the PLAC Laws of Nigeria site explicitly notes that its LFN 2004 compilation is not updated for all post-2002 legislation and directs users to later Acts separately. This is why the product should record source version/effective dates instead of treating a generic law database as perpetually current.

## Verification deferred

Migration execution, RLS tests, source-governance tests, TypeScript/runtime checks and adversarial citation tests remain deferred until the post-remediation verification phase.
