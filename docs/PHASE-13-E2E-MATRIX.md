# Phase 13 — Mobile E2E Verification Matrix

## Required flows

1. Boot and onboarding
2. Authentication: Google sign-in, session restoration, sign-out
3. Consent gate and recovery
4. Chat: send, loading, keyboard open/close, attachment, error state
5. Constitution explorer: search, open section, save citation
6. Document generation: intake, keyboard, submit, loading/result
7. Document review: upload/select, analysis/loading/result
8. Legal-aid discovery: professionals/firms, factual matching, enquiry submission
9. Profile: edit profile, saved rights, privacy/data requests, support report
10. Navigation/deep-link recovery and background-job overlay
11. Professional enquiry form: expert selection → enquiry screen, multiline input, keyboard dismissal, submit control
12. Navigation accessibility: deterministic tab/tool controls and profile/support entry points

## Repository flow coverage

The repository now contains deterministic Maestro definitions for the critical verification surfaces, including authentication, consent, chat/keyboard/attachment states, Constitution, legal discovery, privacy, document review/generation, professional enquiry, saved rights, and navigation/accessibility. Flow 14 adds deterministic empty-state, attachment prompt, profile and privacy navigation coverage. These definitions validate test contracts; they do not substitute for Android device/emulator execution evidence.

## Evidence required

For each flow record pass/fail, device/emulator model, Android version, screen size, and a screenshot/video for any visual or interaction defect. Capture at least one keyboard-open state and one loading state for every form-heavy flow. Flows that depend on real verified marketplace records or live AI services must be executed with an explicit test fixture or marked blocked rather than treated as passed.

## Phase 12 carry-forward gate

Physical Android visual QA remains a release gate. Phase 13 can be developed in parallel, but Phase 12 must not be represented as physically verified until this evidence exists.

## Acceptance

- [ ] All required flows exercised
- [ ] No blocking overlap/clipping defect
- [ ] Keyboard behavior verified on Android
- [ ] Loading/empty/error states verified
- [ ] Touch targets/navigation verified
- [ ] Accessibility labels/states checked on interactive controls
- [ ] Evidence recorded
