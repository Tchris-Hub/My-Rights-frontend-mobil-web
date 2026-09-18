# Task 06 — Sensitive Legal-Data / Privacy Architecture

Status: IMPLEMENTED / VERIFICATION DEFERRED

## Implemented

- Added a privacy processing register describing data categories, purposes, system locations, retention uncertainty, processor flow, cross-border processing, and release evidence requirements.
- Added versioned `privacy_consents` storage with RLS and an Auth signup trigger that records the explicitly accepted Terms/Privacy versions supplied during signup.
- Added canonical Terms and Privacy policy version constants to the mobile configuration.
- Updated signup metadata to carry the accepted Terms/Privacy versions.
- Updated the in-app privacy notice to avoid unsupported zero-retention, zero-logging, and instant-deletion claims and to disclose the AI provider chain/cross-border possibility.
- Kept raw legal prompts, document contents, auth headers, provider keys, and full AI responses out of the intended logging model.

## Not yet claimed

- NDPA compliance certification.
- Confirmed processor/controller legal classification.
- Confirmed NDPC registration requirement/status for the production entity.
- Confirmed provider retention/deletion terms for the production account.
- Verified automated account deletion.
- Verified deployed RLS or database trigger behavior.

## Verification deferred

GitHub Actions capacity is currently unavailable. TypeScript, migration execution, RLS adversarial tests, provider configuration, and runtime privacy checks remain deferred and must be run sequentially after the remediation implementation phases.

## Current evidence

Implementation commits are on `security-hardening-v1`. This task remains open for verification until the deferred checks pass.
