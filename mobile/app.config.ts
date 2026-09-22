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
            infoPlist: {
                NSCameraUsageDescription: 'My Rights uses the camera only when you choose to scan or capture a document.',
                NSMicrophoneUsageDescription: 'My Rights uses the microphone only when you choose voice input.',
                NSLocationWhenInUseUsageDescription: 'My Rights uses your location only when you choose to find nearby legal-aid resources.',
                NSPhotoLibraryUsageDescription: 'My Rights accesses photos only when you choose an image for document review.',
            },
        },
        android: {
            permissions: [
                'CAMERA',
                'RECORD_AUDIO',
                'ACCESS_COARSE_LOCATION',
                'ACCESS_FINE_LOCATION',
            ],
            usesCleartextTraffic: false,
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
        plugins: [
            'react-native-document-scanner-plugin',
            'expo-font',
            'expo-secure-store',
            'expo-sharing',
            'expo-splash-screen',
            'expo-status-bar',
            'expo-web-browser',
        ],
        extra: {
            eas: {
                projectId: '4cd8d457-fde8-43c2-bab7-b8a31df28fd4',
            },
        },
    },
};
