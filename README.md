# MY RIGHTS — Mobile Application

> **Android-first Nigerian legal-information application for understanding rights, reviewing documents, preparing legal matters, and connecting with verified professionals**

MY RIGHTS is designed to make Nigerian legal information and practical legal preparation easier to access.

This repository contains the **mobile client** for MY RIGHTS. It provides the user-facing Android experience and communicates with the MY RIGHTS backend for authentication, legal information, AI workflows, professional discovery, and enquiries.

## What MY RIGHTS is

MY RIGHTS is not intended to be only a general AI chat screen.

The application is organized around a broader legal-access journey:

**Understand your rights → understand your documents → prepare your matter → find verified legal help → connect with a human professional when needed.**

Core areas include:

- Nigerian legal-information chat
- legal-source citations
- saved legal rights
- document review and analysis
- document scanning/image workflows
- AI-assisted document generation
- locally saved/generated documents
- professional directory and legal enquiries
- voice input
- location-assisted legal-aid discovery where the user chooses to use it

## Mobile architecture

The mobile application is built with:

- Expo SDK 57
- React Native 0.86.x
- React 19
- TypeScript
- Better Auth / Expo integration
- Expo SecureStore
- Expo Audio
- Expo Sharing
- Expo Document Picker
- native document scanner
- MapLibre / MapTiler for maps

The application uses custom native builds for functionality that is not available in standard Expo Go.

## Security model

The mobile application is **not the security authority**.

Security-sensitive decisions are delegated to the backend, including:

- authenticated identity
- resource ownership
- AI quota enforcement
- legal-source identity
- professional verification
- enquiry authorization
- account/data authorization

The mobile client must therefore never be treated as a trusted source for these decisions.

## Mobile security and privacy controls

### Secure authentication state

Authentication/session material is handled through the supported authentication integration and secure device storage mechanisms where applicable.

The client communicates with the backend rather than maintaining an independent authorization model.

### Secure transport

Android cleartext HTTP is disabled in the application configuration.

The production application is expected to communicate with the configured HTTPS backend.

### Permission minimization

Native permissions are associated with user-facing functionality such as:

- camera — document scanning/capture
- microphone — voice input
- location — optional nearby legal-aid/resource discovery

Permissions should be requested because the user chose the relevant function, not simply because the application can access the capability.

### Local document handling

Document-review results and generated documents can be saved locally on the device.

Local storage is treated as user-device data rather than as a substitute for backend authorization.

Users should understand that information saved locally is subject to the security of their own device.

### Native-module boundary

Some functionality requires native modules and therefore a custom development/release build.

Examples include:

- document scanning
- MapLibre
- audio functionality

Expo Go is not the final release benchmark for these native capabilities.

## AI safety and reliability on mobile

The mobile client participates in, but does not replace, backend AI safety controls.

AI requests are expected to use backend-managed:

- authentication
- consent checks
- quotas
- idempotency
- input/output limits
- legal grounding
- evidence validation
- document-generation safeguards

The mobile application must correctly handle backend states such as:

- successful response
- validation failure
- quota exhaustion
- request already in progress
- missing information required for document generation
- provider/backend failure
- authentication/session expiry

## Document Review

Document Review supports document/image input and returns structured analysis.

The release workflow must verify:

- PDF extraction
- image input
- structured AI response
- useful rendering in the mobile UI
- local result persistence
- failure handling

## Document Generation

Document Generation is designed as a fact-preserving workflow.

When essential information is missing, the application can request that information before producing a completed document.

The completed-document workflow is intended to prevent the client from presenting fabricated:

- names
- dates
- amounts
- signatures
- legal authorities
- filing/notarization claims

Generated PDFs can be previewed, saved locally, and shared through Android-supported sharing.

## Native build and release policy

Because MY RIGHTS uses native modules, the release artifact must be built and tested as a real native Android application.

The repository contains separate EAS profiles for development, APK testing, and production bundle release.

The final release process should use the exact intended source revision and verify the exact artifact that will be distributed.

Do not certify a release based only on:

- TypeScript compilation
- Expo Go
- source inspection
- a different APK
- a development build

Those checks are useful, but they are not equivalent to release certification.

## Release verification

The mobile repository includes automated checks for:

- release integrity
- security regression
- end-to-end flows
- API/e2e contracts
- release-gate contracts

The final acceptance pass should also exercise the actual Android artifact.

### Core release acceptance areas

1. Sign up / login
2. Terms and Privacy consent
3. Legal chat
4. Nigerian legal question and citation
5. Save and reopen a legal citation
6. Document Review
7. Image/document review
8. Document Generation with complete information
9. Document Generation requiring missing information
10. PDF generation
11. Local PDF persistence
12. Android sharing
13. Native document scanner
14. Audio/voice input
15. Map rendering
16. Professional directory
17. Professional enquiry
18. Logout/login and session behavior
19. AI quota exhaustion
20. Concurrent AI request behavior
21. Native permissions
22. Production API configuration
23. Secure storage/session behavior

The exact release artifact tested should be the artifact certified for release.

## Reliability principles

The mobile client should:

- fail visibly rather than silently inventing results
- preserve user input where safe when a request fails
- distinguish loading, success, validation, quota, and error states
- handle expired sessions cleanly
- avoid trusting client-side authorization state
- avoid assuming a provider response is valid merely because HTTP succeeded
- keep native-module lifecycle handling safe
- avoid making Expo Go behavior the basis for production certification

## Maintenance and keeping the application current

MY RIGHTS should be kept current through controlled engineering rather than uncontrolled dependency churn.

Maintenance includes:

- reviewing dependency/security updates
- checking Expo/React Native compatibility before upgrades
- reviewing native-module compatibility
- updating legal-source integrations when source structures change
- verifying backend API contracts after changes
- rerunning security/regression/release checks after security-sensitive changes
- rebuilding and retesting the release artifact after native changes

An update is not considered safe merely because a package manager reports a newer version.

## Relationship to the backend

The backend repository is:

**Tchris-Hub/alpha01**

The backend is the authoritative security and data layer. The mobile repository is the user-facing client.

Changes that alter API contracts should be coordinated across both repositories.

## Engineering policy

MY RIGHTS is a legal-information product, not a substitute for a lawyer or court.

The application should clearly distinguish:

- information from legal advice
- AI-generated material from verified legal sources
- document preparation from legal representation
- verified professional profiles from unverified users

Security documentation should describe what is actually implemented and tested. It should not claim that the application is impossible to hack, error-free, or legally infallible.

---

**Status:** Active development / release hardening

**Important:** This README documents the mobile architecture, safeguards, and release discipline. It is not a security certification, penetration-test report, legal opinion, or guarantee of vulnerability-free operation.
