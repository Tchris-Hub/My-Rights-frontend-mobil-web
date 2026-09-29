import { authClient } from './auth-client';
import * as Crypto from 'expo-crypto';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'https://alpha01-pink.vercel.app';
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const isApiConfigured = true;

export function createIdempotencyKey(): string {
  return Crypto.randomUUID();
}

function requireApiBaseUrl(): string {
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

async function fetchWithAuthRetry(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const response = await fetch(url, options);
  if (response.status !== 401) return response;

  // Better Auth refreshes the native session/cookie here. Retry the original
  // request once using the refreshed cookie; never loop indefinitely.
  await authClient.getSession();
  const refreshedCookie = await authClient.getCookie();
  const headers = new Headers(options.headers);
  if (refreshedCookie) headers.set('Cookie', refreshedCookie);

  return fetch(url, { ...options, headers });
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
  const response = await fetchWithAuthRetry(`${requireApiBaseUrl()}${path}`, {
    ...options,
    credentials: 'omit',
    headers: await getHeaders({
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string> | undefined),
    }),
  });

  return parseResponse<T>(response);
}

export async function binaryApiRequest<T>(
  path: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
  idempotencyKey?: string,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const requestBody: ArrayBuffer =
    body instanceof Uint8Array
      ? Uint8Array.from(body).buffer
      : body;

  const response = await fetchWithAuthRetry(`${requireApiBaseUrl()}${path}`, {
    method: 'POST',
    credentials: 'omit',
    body: requestBody,
    headers: await getHeaders({
      Accept: 'application/json',
      'Content-Type': contentType,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...(extraHeaders ?? {}),
    }),
  });

  return parseResponse<T>(response);
}

export { API_BASE_URL };
