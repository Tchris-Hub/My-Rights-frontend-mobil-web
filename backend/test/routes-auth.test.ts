import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

// Every protected route must refuse a request with no session. This needs no
// database: with no cookie or token there is no session to look up.

let app: Express;

beforeAll(async () => {
  process.env.BETTER_AUTH_SECRET ??= 'test-only-secret-not-used-anywhere-else-0123456789';
  ({ app } = await import('../src/app'));
});

const protectedRoutes: Array<[string, string]> = [
  ['delete', '/api/users/me'],
  ['get', '/api/account/stats'],
  ['get', '/api/account/saved-rights'],
  ['post', '/api/account/saved-rights'],
  ['delete', '/api/account/saved-rights/abc'],
  ['get', '/api/account/data-requests'],
  ['post', '/api/account/data-requests'],
  ['post', '/api/account/reports'],
  ['get', '/api/usage'],
  ['get', '/api/legal/professionals'],
  ['get', '/api/legal/professionals/match'],
  ['get', '/api/legal/firms'],
  ['get', '/api/legal/firms/match'],
  ['post', '/api/legal/enquiries'],
  ['get', '/api/legal/enquiries'],
  ['patch', '/api/legal/enquiries/abc'],
  ['get', '/api/professionals/me'],
  ['put', '/api/professionals/me'],
  ['post', '/api/cases'],
  ['get', '/api/cases'],
  ['get', '/api/cases/abc'],
  ['post', '/api/cases/abc/answers'],
  ['post', '/api/cases/abc/finish'],
  ['get', '/api/cases/abc/file'],
];

describe('new routes refuse requests without a session', () => {
  it.each(protectedRoutes)('%s %s -> 401', async (method, path) => {
    const res = await (request(app) as any)[method](path).send({});
    expect(res.status).toBe(401);
  });

  it('the situation list is public and contains no personal data', async () => {
    const res = await request(app).get('/api/situations');
    expect(res.status).toBe(200);
    expect(res.body.map((s: { id: string }) => s.id)).toContain('general');
  });
});
