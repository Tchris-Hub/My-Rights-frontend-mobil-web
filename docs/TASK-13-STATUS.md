# Task 13 — Document Generator Safety & Truthful Behavior

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Removed the client-side mocked legal-document generator. Draft generation now goes through the authenticated Supabase legal-advisor gateway with the explicit Nigeria jurisdiction.
- Generation inputs are bounded and treated as untrusted data.
- Draft responses are validated before entering the preview state.
- The preview explicitly identifies the result as an AI-generated draft and instructs the user to verify law, facts, formalities and current requirements with a qualified legal professional before signing or relying on it.
- PDF export now HTML-escapes generated text before rendering it, preventing generated content from being interpreted as arbitrary markup by the print renderer.
- Unauthenticated users are blocked from starting document generation.
- The previous simulated "Architecting Legal Instrument" timer and hard-coded legal agreement are no longer used.

## Safety limitation

The generator produces drafts, not validated legal instruments. It does not currently prove that every clause is legally effective, complete, current, enforceable or suitable for a user's facts. Template/source validation and legal-source retrieval remain separate controls.

## Verification deferred

TypeScript/build checks, authenticated invocation, prompt-injection tests, PDF rendering tests and end-to-end document-generation tests remain deferred until the final verification phase.
