/**
 * Application configuration.
 *
 * Release architecture is Supabase-only. There is deliberately no mobile
 * backend URL, localhost fallback, Railway fallback, or alternate API host.
 */

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
