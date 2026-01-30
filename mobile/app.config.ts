import 'dotenv/config';

const devApiUrl = process.env.DEV_API_URL ?? 'https://injustice-production.up.railway.app/';
const stagingApiUrl = process.env.STAGING_API_URL ?? 'https://staging-api.myrights.ng';
const prodApiUrl = process.env.PROD_API_URL ?? 'https://injustice-production.up.railway.app/';
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export default {
    expo: {
        name: 'My Rights',
        slug: 'my-rights',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'automatic',
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.myrights.app',
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#006B3F',
            },
            package: 'com.myrights.app',
        },
        web: {
            favicon: './assets/favicon.png',
        },
        splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#006B3F',
        },
        plugins: ['react-native-document-scanner-plugin'],
        extra: {
            devApiUrl,
            stagingApiUrl,
            prodApiUrl,
            supabaseUrl,
            supabaseAnonKey,
        },
    },
};
