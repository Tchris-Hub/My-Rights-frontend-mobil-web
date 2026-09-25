# 06 — Acceptance Test Matrix

## Purpose

Feature completion is behavioural, not cosmetic.

## Authentication

AUTH-01:
Google sign-in returns to the app, session is recognized, consent appears when required, then Chat.

AUTH-02:
Magic link returns to the app and establishes a session.

AUTH-03:
Logout removes access to private data and returns to auth state.

## Chat

CHAT-01:
Question streams response and completes with structured metadata.

CHAT-02:
Freshness-sensitive query triggers current-source research.

CHAT-03:
Unsupported claim receives limitation message and no fabricated authority.

CHAT-04:
Citation opens the source or reports clearly that it cannot be opened.

## Constitution

CONST-01:
Clean database contains required corpus.

CONST-02:
Known section search finds the correct provision.

CONST-03:
Save section → Saved Rights → exact section can be reopened.

## Documents

DOC-01:
PDF → extraction → review → structured analysis.

DOC-02:
DOCX → extraction → review → structured analysis.

DOC-03:
TXT → extraction → review → structured analysis.

DOC-04:
Image → binary upload → vision analysis → result.

DOC-05:
Unsupported/oversized/corrupt file → explicit safe error.

DOC-06:
Results show summary, clause attention, detail, source and next step.

## Document Architect

GEN-01:
Templates load from real backend data.

GEN-02:
Clarification stage either makes an actual AI call or is labelled a non-AI requirement form.

GEN-03:
Draft → preview → export with safety notice.

## Legal discovery

HELP-01:
Aid entries show actual verification status and usable contact data.

HELP-02:
Lawyer profile does not display fabricated status, ratings or success claims.

HELP-03:
Natural-language intake returns explainable compatible profiles.

## Professional onboarding

LAW-01:
Student profile is clearly separated from practising-lawyer profile.

LAW-02:
Practising lawyer application enters pending verification before public professional listing.

LAW-03:
Firm account is a separate entity with controlled member association.

## Escalation

ESC-01:
User submits request and receives a reference.

ESC-02:
Request status moves through supported lifecycle and is visible to the client.

## Profile/settings

PROF-01:
Statistics come from actual data.

PROF-02:
Saved Rights persist per account.

SET-01:
Privacy/terms/support controls lead to real destinations.

## Data isolation

- user A cannot read user B conversations
- user A cannot read user B Saved Rights
- user A cannot read user B private documents
- private professional verification evidence is not public
- logout removes account-specific local state

## AI hallucination gate

Test corpus includes:
- known constitutional provision
- outdated source
- conflicting source
- nonexistent law

Expected:
- known provision → direct source support
- outdated source → freshness/supersession handling
- conflict → explicit conflict handling
- nonexistent law → no fabricated citation

## Release rule

The exact commit tested must be recorded for every phase exit.
