import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
if (!baseURL) {
  throw new Error('[My Rights] EXPO_PUBLIC_API_BASE_URL is required.');
}

export const authClient = createAuthClient({
  baseURL: baseURL.replace(/\/$/, ''),
  disableDefaultFetchPlugins: true,
  sessionOptions: {
    refetchInterval: 0,
    refetchWhenOffline: false,
  },
  plugins: [
    expoClient({
      scheme: 'myrights',
      storagePrefix: 'myrights',
      storage: SecureStore,
      cookiePrefix: 'better-auth',
    }),
  ],
});
