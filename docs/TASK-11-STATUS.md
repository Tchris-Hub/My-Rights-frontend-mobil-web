# Task 11 — Legal Product Positioning & Reliance Safeguards

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Strengthened the server-owned AI system instructions to describe the service as general legal information, not legal advice or representation.
- The AI is explicitly instructed not to imply a lawyer-client relationship, predict case outcomes, assign legal risk scores, or make decisions for users.
- High-stakes and deadline-sensitive matters are directed toward review by a qualified Nigerian legal practitioner or appropriate official service.
- Renamed the document-review UI from an "AI Risk Audit" framing to "AI Document Review" and replaced verification/adjudication language with general-review language.
- Reworded document-review result labels so the interface does not imply that the model has issued a binding legal determination.
- Reworded human-escalation UI to avoid promising that a lawyer will contact the user when provider availability and operational fulfillment have not yet been verified.

## Legal basis / context

The Nigerian Legal Practitioners Act contains restrictions concerning persons other than legal practitioners practising or holding themselves out as legal practitioners. The product therefore must not represent an AI system as a legal practitioner or create a misleading impression of professional representation. citeturn0search24

## Remaining work

- Numerical risk/confidence governance is a separate Phase 14 control and is not considered solved by these wording changes.
- Human-lawyer/provider verification and escalation operations are separate Phases 12 and 22.
- Terms/privacy disclosures require final legal/product review.

## Verification deferred

UI traversal, TypeScript/build checks, prompt-regression tests, and production legal copy review remain deferred until the final verification sequence.
