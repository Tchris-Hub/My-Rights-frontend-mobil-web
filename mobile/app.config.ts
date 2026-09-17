import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[My Rights] Missing Supabase environment configuration.');
}

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
            supabaseUrl,
            supabaseAnonKey,
            eas: {
                projectId: '4cd8d457-fde8-43c2-bab7-b8a31df28fd4',
            },
        },
    },
};
