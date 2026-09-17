/**
 * Application configuration.
 *
 * Release architecture is Supabase-only. There is deliberately no mobile
 * backend URL, localhost fallback, Railway fallback, or alternate API host.
 */

export const API_BASE_URL: undefined = undefined;

// Kept temporarily for compile compatibility with legacy service imports.
// These routes are not a supported release backend and must not be used by
// production code. Supabase services are the canonical data/auth path.
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        LOGIN: '/api/v1/auth/login',
        REFRESH: '/api/v1/auth/refresh',
        LOGOUT: '/api/v1/auth/logout',
        ME: '/api/v1/auth/me',
        CHANGE_PASSWORD: '/api/v1/auth/change-password',
    },
    CHAT: {
        MESSAGE: '/api/v1/chat/message',
        STREAM_MESSAGE: '/api/v1/chat/message/stream',
        PUBLIC_MESSAGE: '/api/v1/chat/public/message',
        PUBLIC_STREAM_MESSAGE: '/api/v1/chat/public/message/stream',
        HISTORY: '/api/v1/chat/conversations',
        DETAILS: (id: string) => `/api/v1/chat/conversations/${id}`,
        ESCALATE: '/api/v1/chat/escalate',
        TRANSCRIBE: '/api/v1/chat/public/transcribe',
    },
    DOCUMENTS: {
        ANALYZE: '/api/v1/chat/analyze-document',
        AUTH_ANALYZE: '/api/v1/chat/documents/analyze',
        EXTRACT_TEXT: '/api/v1/chat/public/extract-text',
        VERIFY_STAMP: '/api/v1/chat/public/verify-stamp',
        GENERATE: '/api/v1/chat/generate-document',
        AUTH_GENERATE: '/api/v1/chat/documents/generate',
    },
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'myrights_access_token',
    REFRESH_TOKEN: 'myrights_refresh_token',
    USER_DATA: 'myrights_user_data',
    THEME_MODE: 'myrights_theme_mode',
    ONBOARDING_COMPLETED: 'myrights_onboarding_completed',
    CHAT_HISTORY: 'myrights_chat_history',
    IS_GUEST: 'myrights_is_guest',
};

export const APP_CONFIG = {
    APP_NAME: 'My Rights',
    APP_VERSION: '1.0.0',
    SUPPORT_EMAIL: 'support@myrights.ng',
    PRIVACY_URL: 'https://myrights.ng/privacy',
    TERMS_URL: 'https://myrights.ng/terms',
};
