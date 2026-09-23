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

export async function streamApiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(`${requireApiBaseUrl()}${path}`, {
    ...options,
    credentials: 'omit',
    headers: await getHeaders({
      Accept: 'text/event-stream',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string> | undefined),
    }),
  });

  if (response.status === 401) {
    await authClient.getSession();
  }

  if (!response.ok) {
    return response;
  }

  if (!response.body) {
    throw new Error('Streaming response is unavailable.');
  }

  return response;
}

export async function binaryApiRequest<T>(
  path: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
  idempotencyKey?: string,
): Promise<T> {
  const response = await fetch(`${requireApiBaseUrl()}${path}`, {
    method: 'POST',
    credentials: 'omit',
    body,
    headers: await getHeaders({
      Accept: 'application/json',
      'Content-Type': contentType,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    }),
  });

  if (response.status === 401) {
    await authClient.getSession();
  }
  return parseResponse<T>(response);
}

export { API_BASE_URL };
