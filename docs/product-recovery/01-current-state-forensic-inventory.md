# 01 — Current-State Forensic Inventory

## Purpose

Map intended product behavior against current code, backend routes, data, and earlier working capabilities.

## Production evidence

Recent Vercel runtime logs for the production deployment show successful HTTP execution for:
- /api/auth/get-session
- /api/users/me
- /api/consent
- /api/usage
- /api/chat/sessions
- /api/ai/chat/stream
- /api/legal/constitution
- /api/legal/templates
- /api/legal/lawyers
- /api/legal/aid-centers

This proves that the route layer is broadly alive. It does not prove that payloads, database contents, external-provider calls, or UI behavior are correct.

The earlier Google OAuth "State not found" event was followed by a successful sequence: sign-in 200 → Expo authorization proxy 302 → callback 302 → session 200 → users/me 200. It is therefore historical, not the current core product blocker.

## Current architecture

### Mobile
- navigation
- AuthContext
- api.ts
- chat.service.ts
- document.service.ts
- legalService.ts
- main screens
- profile/settings
- chat citation components

### Backend
- Express app
- Better Auth
- Prisma/Neon
- authorization middleware
- AI gateway
- legal grounding
- quota service
- chat service
- escalation service
- legal data service

### Existing data models
- User, Session, Account, Verification
- ChatSession, ChatMessage
- LegalEscalationRequest
- PrivacyConsent
- LegalSource
- LegalAidCenter
- Lawyer
- LegalTemplate
- ConstitutionChapter, ConstitutionSection
- AiUsage, AiRequest
- RateLimit

## Feature diagnosis

### Authentication
Status: working after the recent navigation fix.
Next: clean-device auth, magic-link E2E, logout isolation, consent transition.

### AI chat
Current:
- authenticated chat
- persisted or incognito conversation path
- legal grounding from database content
- DeepSeek completion/streaming
- quotas

Missing:
- current/recent web research
- freshness/version handling
- source evidence ledger
- canonical citation contract
- provider health diagnostics
- source-open behavior

### Constitution
Current:
- chapter/section database models
- API endpoint
- search UI
- section display
- key takeaways

Missing:
- reproducible corpus import/seed
- version/provenance metadata
- save citation persistence
- source-to-AI deep links
- official-source links
- supersession management

### Document review
Current:
- paste text
- image capture/gallery
- binary image endpoint
- DeepSeek image analysis
- structured results
- qualitative risk labels

Hard failure:
The current mobile document service explicitly throws from extractText() with "Document text extraction is not available yet."

Therefore PDF/DOCX/TXT extraction is not implemented.

Earlier versions contained:
- PDF import
- DOCX import
- TXT import
- OCR/extraction
- scanner flow
- richer result UI

Recovery should port useful capabilities through the current security boundary rather than reverting the old architecture wholesale.

### Document result presentation
Earlier working UI had:
- risk gauge
- overall verdict
- clause cards
- deep analysis
- legal principle
- long-term concerns
- action steps
- disclaimer

Current UI retains clause-oriented analysis but should recover the hierarchy and interactions, not unsafe numeric risk/confidence claims.

### Document Architect
Current:
- template loading
- intake
- final AI generation
- export

Problem:
The "consultation" step is currently local-only. The handler records an acknowledgement rather than calling AI.

Decision:
Either relabel it as requirement collection or implement real AI clarification. Target product uses the latter.

### Chat history
Problem:
Current UI expects fields such as legal_topic, risk_level, is_escalated, message_count; current backend list response does not consistently supply these.

Fix:
Define one ConversationSummary contract and derive every displayed field from real data.

### Citations
Current backend grounding can return:
- title
- section
- excerpt
- citation
- source_url
- issuing_authority

Current UI expects other shapes and has a no-op source-opening interaction.

Fix:
Use one provenance-rich citation contract across backend and mobile.

### Legal aid and lawyers
Current:
- API endpoints
- map
- lists
- filters
- contact/view actions

Problems:
- verification copy can exceed evidence
- lawyer "Highly Recommended" is not a defensible universal ranking
- lawyer contact can fall back to 000
- opening hours are hard-coded
- profile data may be sparse

Fix:
- explicit verification status
- actual contact
- actual opening-hours data or omit it
- verification source/date
- profile completeness
- reporting/moderation

### Profile/settings
Problems:
- hard-coded activity counts
- Saved Rights appears without persistence
- several menu items have no meaningful action

Fix:
real statistics, saved rights, privacy center, support, data controls.

## Important old-vs-new rule

For every old capability:
1. inspect old behavior;
2. determine why it disappeared;
3. determine whether security hardening intentionally removed it;
4. port the useful behavior;
5. re-apply current authz/privacy/input validation;
6. add an acceptance test.

Never blindly roll back security work.

## Main conclusion

The application is fragmented, not lost.

The recovery program should establish one canonical contract per feature and then make:
Mobile → API → database/provider → response → UI

agree end-to-end.
