/**
 * API Configuration
 * Base URL and endpoints for backend communication
 *
 * IMPORTANT FOR LOCAL DEVELOPMENT:
 * Replace the LOCAL_NETWORK_IP below with your computer's local IP address.
 * Find it using:
 *   - Windows: ipconfig (look for "IPv4 Address")
 *   - Mac/Linux: ifconfig (look for "inet")
 *
 * The backend must be running on port 8000.
 */

// --------------------------------------------------
// Environment Configuration
// --------------------------------------------------
const LOCAL_NETWORK_IP = '172.20.10.4'; // <-- UPDATE THIS for local development
const LOCAL_PORT = 8000;

const PRODUCTION_API_URL = 'https://api.myrights.ng'; // Update when production is available
const STAGING_API_URL = 'https://staging-api.myrights.ng'; // Optional staging environment

/**
 * Determines the correct API URL based on the environment.
 * In __DEV__ mode, it uses the local network IP.
 * In production, it uses the deployed API.
 */
const getApiBaseUrl = (): string => {
    if (__DEV__) {
        return `http://${LOCAL_NETWORK_IP}:${LOCAL_PORT}`;
    }
    return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

// --------------------------------------------------
// API Endpoints
// --------------------------------------------------
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        LOGIN: '/api/v1/auth/login',
        REFRESH: '/api/v1/auth/refresh',
        LOGOUT: '/api/v1/auth/logout',
        ME: '/api/v1/auth/me',
        CHANGE_PASSWORD: '/api/v1/auth/change-password',
    },

    // Chat (Authenticated & Anonymous)
    CHAT: {
        MESSAGE: '/api/v1/chat/message',
        PUBLIC_MESSAGE: '/api/v1/chat/public/message',
        HISTORY: '/api/v1/chat/conversations',
        DETAILS: (id: string) => `/api/v1/chat/conversations/${id}`,
        ESCALATE: '/api/v1/chat/escalate',
        TRANSCRIBE: '/api/v1/chat/public/transcribe',
    },

    // Documents (Authenticated & Anonymous)
    DOCUMENTS: {
        ANALYZE: '/api/v1/chat/analyze-document',
        GENERATE: '/api/v1/chat/generate-document',
    },
};

// --------------------------------------------------
// Storage Keys
// --------------------------------------------------
// Note: SecureStore keys must contain only alphanumeric characters, ".", "-", and "_"
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'myrights_access_token',
    REFRESH_TOKEN: 'myrights_refresh_token',
    USER_DATA: 'myrights_user_data',
    THEME_MODE: 'myrights_theme_mode',
    ONBOARDING_COMPLETED: 'myrights_onboarding_completed',
    CHAT_HISTORY: 'myrights_chat_history',
};

// --------------------------------------------------
// App Configuration
// --------------------------------------------------
export const APP_CONFIG = {
    APP_NAME: 'My Rights',
    APP_VERSION: '1.0.0',
    SUPPORT_EMAIL: 'support@myrights.ng',
    PRIVACY_URL: 'https://myrights.ng/privacy',
    TERMS_URL: 'https://myrights.ng/terms',
};
