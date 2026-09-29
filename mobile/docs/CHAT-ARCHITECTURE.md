# My Rights Mobile Chat Architecture

The mobile chat client uses a conventional authenticated JSON request/response API.

## One user action

    ChatScreen
      -> chatService.sendMessage()
      -> apiRequest()
      -> POST /api/ai/chat
      -> JSON response
      -> validateChatResponse()
      -> render one assistant message

There is no client-side SSE parser in the normal chat path.

## Why

The legal backend must finish evidence retrieval and, when evidence exists, final evidence verification before an answer is considered complete. Token streaming from the provider therefore cannot be safely displayed as the authoritative answer.

A loading bubble provides the normal thinking state while the backend completes the request. The final verified or qualified answer is rendered once.

## Evidence states

- `verified_context`: evidence came from the verified local corpus.
- `live_research`: evidence came from route-aware authoritative web research.
- `unverified`: allowed for general/conceptual responses, but the client rejects any citation that was not supplied by the server.

The client does not treat `live_research` as a transport or server failure.

## Conversation creation

For a new persistent chat the client sends `conversation_id: null` and `persist: true`. The server creates and returns the conversation ID after a successful response.

For Incognito, the client sends `persist: false` and no conversation ID. The server does not persist the interaction.

## Authentication retry

The API layer refreshes the Better Auth session once after a 401 and retries the original request using the refreshed cookie. It never loops indefinitely.

## Error handling

Network/API errors are converted to a single user-facing failure state. Provider, legal-research, and verification details remain server-side; development logs can preserve sanitized diagnostic information.

## Removed dependency

The normal chat experience no longer depends on React Native streaming/SSE decoding. The legacy stream API remains on the backend only for compatibility with older clients.