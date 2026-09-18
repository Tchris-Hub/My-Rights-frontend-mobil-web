# Task 12 — Lawyer / Legal-Aid Verification & Escalation

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Removed fabricated lawyer/legal-aid credibility labels and default review counts from the mobile legal directory service.
- Directory records now expose an explicit verification state: `Verified by source registry` or `Unverified`.
- Added optional verification metadata fields to lawyer/legal-aid types so the UI can distinguish source-backed records from ordinary database entries.
- The escalation interface no longer promises that a lawyer or legal professional will contact a user without an operational provider workflow proving that outcome.
- Conversation deletion now requires an authenticated Supabase session before attempting the deletion.

## Source standard

The Nigerian Bar Association currently publishes an official searchable Annual Practising List and provides digital practice-license verification. The NBA also announced a National Law Firm Directory through its Section on Legal Practice in January 2026. These are appropriate authoritative sources for a future server-side verification workflow; the app should not infer professional status from ratings, review counts, names or database presence. citeturn0search0turn0search6

## Remaining work

A production directory still needs a server-side ingestion/verification job, freshness policy, provider identity checks, complaint/removal process, escalation SLA evidence, consent/data-sharing controls, and adversarial tests. Those are not claimed to exist yet.

## Verification deferred

Live source verification, database migration/runtime checks, UI traversal, TypeScript/build checks and escalation end-to-end tests remain deferred until the final verification phase.
