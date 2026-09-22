import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { prisma } from '../src/db';
import * as chat from '../src/services/chat';
import * as escalation from '../src/services/escalation';
import { HttpError } from '../src/authz';

// Integration tests for the authorization model. These require a reachable Neon
// database (DATABASE_URL set) and are skipped otherwise — run them after the
// Neon connection string is configured.

const run = process.env.DATABASE_URL ? describe : describe.skip;

run('authorization & cross-user isolation (RLS equivalent)', () => {
  let userA = '';
  let userB = '';

  beforeAll(async () => {
    const suffix = Date.now();
    const a = await prisma.user.create({ data: { email: `isolation-a-${suffix}@test.local`, name: 'Isolation A' } });
    const b = await prisma.user.create({ data: { email: `isolation-b-${suffix}@test.local`, name: 'Isolation B' } });
    userA = a.id;
    userB = b.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [userA, userB] } } });
    await prisma.$disconnect();
  });

  it('a user cannot list or read another user session', async () => {
    const session = await chat.createSession(userA, 'private');
    const list = await chat.listSessions(userB);
    expect(list.find((s) => s.id === session.id)).toBeUndefined();

    await expect(chat.getSession(userB, session.id)).rejects.toMatchObject({ status: 404 });
  });

  it('a user cannot write a message into another user session', async () => {
    const session = await chat.createSession(userA, 'owned by A');
    await expect(chat.addMessage(userB, session.id, 'user', 'hi')).rejects.toMatchObject({
      status: 404,
    });
    await expect(chat.listMessages(userB, session.id)).rejects.toMatchObject({ status: 404 });
  });

  it('a user cannot delete another user session', async () => {
    const session = await chat.createSession(userA, 'delete target');
    await expect(chat.deleteSession(userB, session.id)).rejects.toMatchObject({ status: 404 });
    await expect(chat.getSession(userA, session.id)).resolves.toBeTruthy();
  });

  it('escalation on another user conversation is rejected; own is accepted', async () => {
    const session = await chat.createSession(userA, 'escalation target');

    await expect(
      escalation.createEscalation(userB, {
        conversationId: session.id,
        reason: 'cross-account attempt',
      }),
    ).rejects.toMatchObject({ status: 404 });

    const created = await escalation.createEscalation(userA, {
      conversationId: session.id,
      reason: 'legitimate request',
      urgency: 'high',
    });
    expect(created.reference_number).toBeTruthy();

    const own = await escalation.listEscalations(userA);
    expect(own.some((e) => e.reference_number === created.reference_number)).toBe(true);
    const other = await escalation.listEscalations(userB);
    expect(other.some((e) => e.reference_number === created.reference_number)).toBe(false);
  });

  it('HttpError is a controlled error type', () => {
    expect(() => {
      throw new HttpError(404, 'Conversation not found.');
    }).toThrow(HttpError);
  });
});
