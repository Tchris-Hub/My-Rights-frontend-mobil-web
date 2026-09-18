# Task 16 — Chat Persistence Consistency

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Supabase is now the canonical persistence layer for authenticated chat history.
- Streaming chat now creates an account-owned `chat_sessions` row when needed, persists the user message, streams the assistant response, and persists the completed assistant message.
- The stream returns the persisted conversation ID so the UI can retain the correct server conversation.
- Private/Incognito sessions explicitly set `persist: false`; they remain ephemeral and are not written to chat history.
- Removed the previous generic AsyncStorage chat-cache writes/reads from ChatScreen.
- Legacy cache compatibility methods now deliberately clear/return no chat content rather than storing legal text locally.
- Chat-history and conversation-detail reads now explicitly require an authenticated Supabase session before querying.
- Conversation deletion remains authenticated and account-scoped; database authorization is still expected to be enforced by RLS.
- New persisted chat sessions explicitly set `user_id` from the authenticated Supabase user rather than relying on an implicit client-side default.

## Consistency model

Authenticated normal chats: UI → authenticated Supabase session → account-owned Postgres history.

Private/Incognito chats: UI → authenticated AI gateway → no chat-history persistence.

The product no longer has a third generic AsyncStorage chat-history path.

## Verification deferred

Streaming persistence, RLS ownership, account-switch isolation, logout cleanup and private-session non-persistence require runtime/database verification and remain deferred. No end-to-end persistence pass is claimed.
