import { HttpError } from '../authz';

// Small input helpers. Every string from a client is trimmed, length-capped and
// rejected if it is the wrong type, so services never see raw request bodies.

export function reqString(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `${field} is required.`);
  const v = value.trim();
  if (v.length > max) throw new HttpError(400, `${field} is too long.`);
  return v;
}

export function optString(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text.`);
  const v = value.trim();
  if (v.length > max) throw new HttpError(400, `${field} is too long.`);
  return v || null;
}

export function stringList(value: unknown, field: string, maxItems = 20, maxLen = 80): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new HttpError(400, `${field} must be a list.`);
  if (value.length > maxItems) throw new HttpError(400, `${field} has too many items.`);
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') throw new HttpError(400, `${field} must be a list of text.`);
    const v = item.trim();
    if (v.length > maxLen) throw new HttpError(400, `${field} has an item that is too long.`);
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) throw new HttpError(400, `${field} is not valid.`);
  return value as T;
}

export function newReference(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}
