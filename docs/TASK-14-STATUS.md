# Task 14 — Numerical Risk / Confidence Scoring Governance

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Removed numerical `risk_score` and `confidence_score` fields from the mobile document-analysis contract.
- Removed the numerical risk score display from the Document Review UI.
- Document analysis now asks the model to describe uncertainty and potential concerns qualitatively rather than assigning numerical risk/confidence scores.
- The client boundary defensively discards legacy numeric score fields if an older backend/provider response still contains them.
- The server-owned legal-advisor instructions prohibit numerical legal risk/confidence scoring.
- Document generation instructions prohibit fabricated legal validity, official approval, filing status, signatures, stamps, notarization, parties, facts and citations, and require placeholders when information is missing.

## Rationale

A model-generated number can be mistaken for an objective legal probability, legal certainty, or validated professional assessment. The product therefore does not expose model-generated numerical risk/confidence scores as decision signals.

Qualitative findings remain subject to the existing general-information disclaimer, jurisdiction controls, source-verification limits and human-review safeguards.

## Verification deferred

TypeScript/build checks, end-to-end model response tests, prompt-injection tests and regression tests for legacy score-shaped responses remain deferred until the final verification phase. No verification pass is claimed here.
