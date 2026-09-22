import { authClient } from './auth-client';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/$/, '') : null;

export const isApiConfigured = Boolean(API_BASE_URL);

function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('[My Rights] Backend URL is not configured. Set EXPO_PUBLIC_API_BASE_URL and restart Expo.');
  }
  return API_BASE_URL;
}

async function getHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extra,
  };
  const cookies = await authClient.getCookie();
  if (cookies) headers.Cookie = cookies;
  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = null; }
  }
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : response.status === 401
          ? 'Authentication required.'
          : 'Request could not be completed.';
    throw new Error(message);
  }
  return payload as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${requireApiBaseUrl()}${path}`, {
    ...options,
    credentials: 'omit',
    headers: await getHeaders({
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string> | undefined),
    }),
  });

  if (response.status === 401) {
    await authClient.getSession();
  }
  return parseResponse<T>(response);
}

export { API_BASE_URL };
