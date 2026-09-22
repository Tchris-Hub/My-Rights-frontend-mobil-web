import 'react-native-url-polyfill/auto';
import * as Crypto from 'expo-crypto';

// Polyfill for WebCrypto getRandomValues
if (typeof globalThis.crypto !== 'object') {
    globalThis.crypto = {} as any;
}

// @ts-ignore
if (typeof globalThis.crypto.getRandomValues !== 'function') {
    // @ts-ignore
    globalThis.crypto.getRandomValues = (array: any) => {
        return Crypto.getRandomValues(array);
    };
}

// Full WebCrypto subtle polyfill for PKCE sha256
// @ts-ignore
if (typeof globalThis.crypto.subtle !== 'object') {
    // @ts-ignore
    globalThis.crypto.subtle = {
        digest: async (algorithm: string, data: Uint8Array) => {
            if (algorithm === 'SHA-256') {
                return await Crypto.digest(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    data as any
                );
            }
            throw new Error(`Algorithm ${algorithm} not supported by polyfill`);
        },
    };
}

// Simple TextEncoder polyfill for Supabase
if (typeof TextEncoder === 'undefined') {
    globalThis.TextEncoder = class TextEncoder {
        encode(str: string) {
            const arr = new Uint8Array(str.length);
            for (let i = 0; i < str.length; i++) {
                arr[i] = str.charCodeAt(i);
            }
            return arr;
        }
    } as any;
}
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
