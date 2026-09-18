# Task 22 — Human-Lawyer Escalation Operational Controls

## Implementation status

**Implemented in source; verification deferred.**

### Changes

- Added `legal_escalation_requests` with explicit lifecycle states: pending, accepted, declined, and closed.
- Added ownership RLS: users can create and view only their own requests.
- Escalation inserts validate that the referenced conversation belongs to the authenticated user.
- Anonymous users have no access.
- Client-side update/delete permissions are not granted, preventing users from self-assigning status or rewriting an escalation after submission.
- Added authenticated `chatService.escalateConversation()` with reason-length validation and a generated reference number.
- Existing UI wording already avoids promising lawyer acceptance or response times; it now has a real persistence path rather than calling a missing service method.

## Important operational boundary

The database queue is not itself proof that a human lawyer has accepted or reviewed a request. Provider assignment, notification, service-level commitments, and staff access controls remain operational dependencies outside this client implementation.

## Verification

Verification is intentionally **deferred** because GitHub Actions runner/account capacity is unavailable.

Post-remediation checks must confirm:
1. authenticated users can create their own requests;
2. cross-user conversation/request insertion is rejected by RLS;
3. anonymous insertion/read is rejected;
4. client cannot alter status;
5. provider/staff workflow, notification, and retention controls are documented before production claims of human response are made.
