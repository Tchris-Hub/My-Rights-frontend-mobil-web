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
            eas: {
                projectId: '4cd8d457-fde8-43c2-bab7-b8a31df28fd4',
            },
        },
    },
};
