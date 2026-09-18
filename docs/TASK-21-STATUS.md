# Task 21 — Mobile Platform Privacy / Security Hardening

## Implementation status

**Implemented in source; verification deferred.**

### Changes

- Supabase Auth session persistence now uses `expo-secure-store` instead of general AsyncStorage.
- Secure auth storage supports bounded chunking for session values so the implementation does not silently fall back to plaintext app storage when the session is larger than a single secure-storage value.
- Secure auth storage treats malformed/incomplete chunk state as an error rather than reconstructing a partial session.
- Android release configuration explicitly requests only the permissions currently used by the app: camera, microphone, and foreground location.
- iOS release configuration provides purpose strings for camera, microphone, location, and photo-library access.
- Android cleartext network traffic is explicitly disabled.
- Voice-input errors now use the centralized redacting logger.
- No legal chat/document content was added to persistent device caching.

## Verification

Verification is intentionally **deferred** because GitHub Actions runner/account capacity is unavailable.

Post-remediation checks must confirm:
1. Expo resolves the intended permission set without unexpected permissions from plugins;
2. SecureStore session round-trip works across app restart/logout/account switch;
3. no auth/session tokens are written to AsyncStorage;
4. Android rejects unintended cleartext traffic;
5. iOS/Android permission prompts match actual user-initiated feature use;
6. temporary audio/document files are removed after use and failures do not leave sensitive artifacts behind.
