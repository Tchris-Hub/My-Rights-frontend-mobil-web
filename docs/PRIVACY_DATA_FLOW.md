# My Rights — Current Privacy/Data-Flow Baseline

Branch: `security-hardening-v1`

## Current flow

1. The mobile client stores the Supabase Auth session in AsyncStorage under the canonical auth storage key.
2. Authenticated legal queries are sent to the Supabase `legal-advisor` Edge Function.
3. The Edge Function authenticates the user JWT before accepting a legal query.
4. The Edge Function sends the user message plus a server-owned system instruction to OpenRouter.
5. OpenRouter routes the request to the configured model provider.
6. Authenticated chat history may be stored in Supabase `chat_sessions` / `chat_messages`; access must be enforced by deployed RLS.
7. The mobile app may cache authenticated chat content locally for the active conversation; logout/cache isolation is handled in a later remediation task.

## Privacy claims that are deliberately NOT made

- No "Zero-Trace" guarantee.
- No claim that AI requests never contain identifiers.
- No claim that provider logs/retention are zero.
- No claim that the AI interaction is attorney-client privileged.
- No claim that deletion is complete until database, provider, local-cache and operational retention paths are verified.

## Private-session wording

The app uses "Private Session" rather than "Incognito / Zero-Trace". The intended meaning is limited: the session is not added to the My Rights conversation history by the authenticated chat flow. The request still traverses the AI service and may appear in security/service logs.

## Required later evidence

Before trusted public release, verify:

- deployed Supabase RLS policies;
- provider retention/logging configuration and contractual terms;
- application/Edge Function logs and redaction;
- AsyncStorage/local cache deletion on logout/account switch;
- account deletion/export behavior;
- privacy policy and third-party processor disclosures;
- jurisdiction-specific privacy obligations applicable to the production deployment.

This document is an engineering data-flow record, not a legal compliance certification.
