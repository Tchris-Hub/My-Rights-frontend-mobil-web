# Task 07 — Local-Device Data Isolation / Account Switching

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Supabase Auth remains the canonical authentication session store.
- Account switching tracks the active authenticated user ID and clears app-owned account-scoped state when the authenticated user changes.
- Logout clears app-owned account-scoped state before returning the UI to guest state.
- Legal chat content is no longer persisted to the generic AsyncStorage chat-history key. The backend account-scoped history is the intended source for authenticated history.
- Legacy chat-cache method signatures remain temporarily compatible but now remove/return no cached legal content, preventing older callers from reintroducing local legal-text persistence.
- Guest chat state is cleared when leaving the chat screen.

## Security intent

The device should not retain another user's legal conversation merely because a second account signs in on the same device. Generic local storage is treated as untrusted and non-authoritative.

## Verification deferred

Runtime account-switch testing, logout/cache inspection, reinstall/restore testing, and TypeScript/Expo verification remain deferred until the post-remediation verification phase because GitHub Actions capacity is unavailable.
