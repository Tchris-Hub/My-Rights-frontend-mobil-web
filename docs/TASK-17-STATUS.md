# Task 17 — Fail-Closed Error Handling / Safe Degraded Modes

## Implementation status

**Implemented in source; verification deferred.**

This task hardens failure paths so the app does not convert backend/provider failures, incomplete AI streams, unsupported document operations, or simulated UI behavior into apparent successful legal results.

### Changes

- AI gateway:
  - Unexpected internal errors are sanitized before returning to clients.
  - Streaming size-limit failures now terminate the stream as an error instead of emitting a synthetic `[DONE]` marker.
  - Malformed JSON request bodies receive an explicit client-safe error.
- Chat service:
  - Conversation creation and user-message persistence errors now fail closed.
  - Non-stream AI responses are schema-checked before use.
  - Assistant persistence failures are surfaced instead of silently ignored.
  - SSE parsing preserves incomplete event frames across network chunks.
  - A stream is considered successful only after an explicit `[DONE]` marker and a non-empty assistant response.
  - History read failures no longer silently become an empty history.
- Document service:
  - Analysis responses are structurally validated before use.
  - Empty/invalid generator responses fail closed.
  - Unsupported OCR/text extraction now throws instead of returning a placeholder success string.
  - Unsupported authenticity verification now throws instead of returning an apparent verification result.
- Document generator UI:
  - Removed a fake delayed "AI Architect" response that claimed requirements would be incorporated despite no AI call.
  - Draft preview is entered only after a real generator response is returned and validated.
  - Missing template selection is rejected before generation.

## Verification

Verification is intentionally **deferred** because the current GitHub Actions runner/account capacity is unavailable. No TypeScript, Expo, Supabase runtime, streaming, or end-to-end checks are claimed as passed for this task.

After all remediation phases are implemented, run the locked verification sequence and remediate any failures before treating this task as verified.
