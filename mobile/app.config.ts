import 'dotenv/config';

const devApiUrl = process.env.DEV_API_URL ?? 'http://192.168.0.138:8000';
const stagingApiUrl = process.env.STAGING_API_URL ?? 'https://staging-api.myrights.ng';
const prodApiUrl = process.env.PROD_API_URL ?? 'https://alpha01-pink.vercel.app';
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

// Keys are injected via environment variables or defaults

export default {
    expo: {
        name: 'My Rights',
        slug: 'my-rights',
        scheme: 'myrights',
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
                foregroundImage: './assets/adaptive_icon.png',
                backgroundColor: '#006B3F',
            },
            package: 'com.myrights.app',
        },
        web: {
            favicon: './assets/favicon.png',
        },
        splash: {
            image: './assets/splash_icon.png',
            resizeMode: 'contain',
            backgroundColor: '#FFFFFF',
        },
        plugins: ['react-native-document-scanner-plugin', 'expo-web-browser'],
        extra: {
            devApiUrl,
            stagingApiUrl,
            prodApiUrl,
            supabaseUrl,
            supabaseAnonKey,
            eas: {
                projectId: '4cd8d457-fde8-43c2-bab7-b8a31df28fd4',
            },
        },
    },
};
