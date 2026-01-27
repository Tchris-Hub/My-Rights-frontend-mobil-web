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
// Environment Configuration (driven by Expo manifest extras)
// --------------------------------------------------
import Constants from 'expo-constants';

type ApiEnvironment = 'development' | 'staging' | 'production';

type ExpoExtraConfig = {
    devApiUrl?: string;
    stagingApiUrl?: string;
    prodApiUrl?: string;
    apiEnvironment?: ApiEnvironment;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;

const resolveEnvironment = (): ApiEnvironment => {
    if (extra.apiEnvironment) {
        return extra.apiEnvironment;
    }

    return __DEV__ ? 'development' : 'production';
};

const getApiBaseUrl = (): string => {
    const environment = resolveEnvironment();

    switch (environment) {
        case 'staging':
            return extra.stagingApiUrl ?? extra.prodApiUrl ?? 'https://api.myrights.ng';
        case 'production':
            return extra.prodApiUrl ?? 'https://api.myrights.ng';
        case 'development':
        default:
            return extra.devApiUrl ?? 'http://127.0.0.1:8000';
    }
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
        EXTRACT_TEXT: '/api/v1/chat/public/extract-text',
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
    IS_GUEST: 'myrights_is_guest',
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
