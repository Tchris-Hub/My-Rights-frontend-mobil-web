import { prisma } from '../db';
import { HttpError } from '../authz';

// Ownership is enforced by including `user_id` in every where clause. A request
// for another user's session returns 404 (not 403) so existence is not leaked —
// the same observable behavior as the Supabase RLS policies returning no rows.
const notFound = () => new HttpError(404, 'Conversation not found.');

export async function createSession(userId: string, title?: string) {
  return prisma.chatSession.create({
    data: { user_id: userId, title: title?.trim().slice(0, 200) || null },
    select: { id: true, title: true, created_at: true, updated_at: true },
  });
}

export async function listSessions(userId: string) {
  return prisma.chatSession.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: 'desc' },
    select: { id: true, title: true, created_at: true, updated_at: true },
  });
}

export async function getSession(userId: string, sessionId: string) {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, user_id: userId },
    include: { messages: { orderBy: { created_at: 'asc' } } },
  });
  if (!session) throw notFound();
  return session;
}

export async function deleteSession(userId: string, sessionId: string) {
  const { count } = await prisma.chatSession.deleteMany({
    where: { id: sessionId, user_id: userId },
  });
  if (count === 0) throw notFound();
}

export async function addMessage(
  userId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new HttpError(400, 'Message content is required.');
  }
  if (content.length > 12_000) {
    throw new HttpError(400, 'Message content is too large.');
  }

  await assertOwnsSession(userId, sessionId);

  return prisma.chatMessage.create({
    data: { session_id: sessionId, role, content: content.trim() },
    select: { id: true, session_id: true, role: true, content: true, created_at: true },
  });
}

export async function listMessages(userId: string, sessionId: string) {
  await assertOwnsSession(userId, sessionId);
  return prisma.chatMessage.findMany({
    where: { session_id: sessionId },
    orderBy: { created_at: 'asc' },
  });
}

async function assertOwnsSession(userId: string, sessionId: string): Promise<void> {
  const owns = await prisma.chatSession.findFirst({
    where: { id: sessionId, user_id: userId },
    select: { id: true },
  });
  if (!owns) throw notFound();
}
