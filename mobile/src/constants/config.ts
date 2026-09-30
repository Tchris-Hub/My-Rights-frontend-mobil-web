/**
 * Client configuration. Only non-secret values may use EXPO_PUBLIC_* variables.
 * The backend URL is intentionally supplied at runtime; no credentials are
 * embedded in the mobile bundle.
 */
export const STORAGE_KEYS = {
    THEME_MODE: 'myrights_theme_mode',
    ONBOARDING_COMPLETED: 'myrights_onboarding_completed',
    CHAT_HISTORY: 'myrights_chat_history',
    IS_GUEST: 'myrights_is_guest',
    PENDING_CONSENT: 'myrights_pending_consent',
    DOCUMENT_REVIEW_HISTORY: 'myrights_document_review_history',
};

export const APP_CONFIG = {
    APP_NAME: 'My Rights',
    APP_VERSION: '1.0.0',
    SUPPORT_EMAIL: 'support@myrights.ng',
    PRIVACY_URL: 'https://myrights.ng/privacy',
    TERMS_VERSION: '2026-09-18',
    PRIVACY_POLICY_VERSION: '2026-09-18',
    TERMS_URL: 'https://myrights.ng/terms',
    LEGAL_JURISDICTION: 'Nigeria',
    LEGAL_JURISDICTIONS: ['Nigeria'] as const,
};
