# Task 10 — Explicit Jurisdiction Controls

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- The legal-advisor Edge Function now rejects requests without a jurisdiction.
- The server allow-lists supported jurisdictions instead of accepting arbitrary client text. Current supported scope is Nigeria only.
- The mobile chat service requires a jurisdiction for every legal-advisor request.
- The mobile app has an explicit legal-jurisdiction configuration (`Nigeria`) rather than silently relying on model inference.
- The AI system instruction states that the supplied jurisdiction must be applied and must not be substituted with another jurisdiction.
- The AI response includes the jurisdiction used by the server.

## Safety boundary

Jurisdiction is an application scope control, not proof that a particular answer is legally correct. The product still requires verified legal sources and effective-date handling before presenting legal research as authoritative.

## Current scope

Only Nigeria is enabled. Other jurisdictions must not be exposed in the UI or accepted by the gateway until their legal-source registry, source verification process, disclosures and tests are implemented.

## Verification deferred

TypeScript compilation, Edge Function deployment/invocation, negative jurisdiction tests, and end-to-end UI verification remain deferred until the post-remediation verification phase.
