# Task 08 — Document Upload / Malicious-Content Isolation

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Added a centralized untrusted-document intake policy with a 10 MB maximum.
- Allow-listed PDF, TXT, JPEG, PNG and WebP document types/extensions.
- Reject unsupported MIME types and extension mismatches when metadata is available.
- Sanitized attachment names before displaying them in chat text.
- Removed any need for the chat screen to read, execute, preview, or upload selected binary bytes; the current attachment flow sends only a sanitized display label.
- Centralized extracted-text limits at 40,000 characters.
- Wrapped extracted document text in an explicit untrusted-content boundary before AI analysis.
- Explicitly instructs the AI layer not to follow commands or prompt-injection content embedded in documents.
- Document authenticity verification remains truthful: it returns Unknown/Low because visual verification is not implemented.

## Security boundary

A selected file is untrusted input. File names, MIME metadata and extracted text are attacker-controlled. Future binary extraction must occur in an isolated server-side processing boundary with resource limits and without executing document content.

## Verification deferred

Runtime file-type tests, oversized-file tests, malformed-file tests, extraction/parser isolation tests, TypeScript/Expo checks and end-to-end AI tests remain deferred until the post-remediation verification phase.
