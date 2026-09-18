/**
 * Security regression cases for the legal-advisor boundary.
 *
 * These cases are intentionally kept in the repository so the deferred
 * verification pass can execute them when CI capacity is restored.
 *
 * Required cases:
 * 1. unauthenticated requests are rejected;
 * 2. client system/developer/assistant roles are rejected;
 * 3. oversized request bodies are rejected;
 * 4. excessive message counts/content are rejected;
 * 5. provider failures never expose provider response bodies;
 * 6. provider output above the configured limit is rejected;
 * 7. stream output is capped;
 * 8. browser origins not in ALLOWED_ORIGINS are rejected.
 *
 * This file is a test specification until the Supabase local/remote test
 * harness is connected. It is not evidence that these cases have passed.
 */
export const LEGAL_ADVISOR_SECURITY_CASES = [
  'unauthenticated request -> 401',
  'system/developer/assistant client role -> 400',
  'request body > 64 KiB -> 413',
  'message count outside 1..12 -> 400',
  'message > 12,000 chars -> 400',
  'aggregate message content > 48,000 chars -> 400',
  'provider non-2xx -> sanitized 4xx/502 response',
  'provider output > 20,000 chars -> 502',
  'stream > 128 KiB -> terminated',
  'unlisted browser Origin -> 403',
] as const;
