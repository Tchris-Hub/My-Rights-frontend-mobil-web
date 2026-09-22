import { afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { authTestHooks } from '../src/lib/auth';

const run = process.env.DATABASE_URL ? describe : describe.skip;

run('authentication (HTTP end-to-end)', () => {
  const email = `auth-${Date.now()}@test.local`;
  const password = 'correct-horse-battery-staple';
  const agent = request.agent(app);

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('signup → unverified 401 → verify → protected access → logout → 401', async () => {
    // 1. Signup (email verification required; no session yet).
    const signup = await agent.post('/api/auth/sign-up/email').send({ email, password, name: 'Auth Test' });
    expect(signup.status).toBe(200);

    // 2. Protected endpoint rejects the unauthenticated agent.
    const beforeVerify = await agent.get('/api/users/me');
    expect(beforeVerify.status).toBe(401);

    // 3. Verify email (token captured by the email callback, no SMTP needed).
    const token = authTestHooks.lastVerificationToken;
    expect(token).toBeTruthy();
    const verify = await agent.get(`/api/auth/verify-email?token=${encodeURIComponent(token as string)}`);
    expect(verify.status).toBeLessThan(400);

    // 4. Auto-signed-in session cookie now authorizes the protected endpoint.
    const me = await agent.get('/api/users/me');
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);

    // 5. Logout revokes the session.
    const logout = await agent.post('/api/auth/sign-out');
    expect(logout.status).toBeLessThan(400);

    // 6. Revoked session is rejected.
    const afterLogout = await agent.get('/api/users/me');
    expect(afterLogout.status).toBe(401);
  });
});
