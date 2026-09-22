import { prisma } from '../db';
import { HttpError } from '../authz';

const URGENCIES = ['low', 'medium', 'high', 'critical'] as const;

export interface EscalationInput {
  conversationId?: string | null;
  reason: string;
  urgency?: string;
}

export async function createEscalation(userId: string, input: EscalationInput) {
  const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
  if (!reason) throw new HttpError(400, 'A reason is required.');
  if (reason.length > 4000) throw new HttpError(400, 'Escalation reason is too long.');

  const urgency = (input.urgency ?? 'medium') as (typeof URGENCIES)[number];
  if (!URGENCIES.includes(urgency)) throw new HttpError(400, 'Invalid urgency.');

  // Cross-account guard: a referenced conversation must belong to the caller.
  if (input.conversationId) {
    const owns = await prisma.chatSession.findFirst({
      where: { id: input.conversationId, user_id: userId },
      select: { id: true },
    });
    if (!owns) throw new HttpError(404, 'Conversation not found.');
  }

  const referenceNumber = `MR-${Date.now().toString(36).toUpperCase()}-${userId.slice(0, 6).toUpperCase()}`;

  return prisma.legalEscalationRequest.create({
    data: {
      reference_number: referenceNumber,
      user_id: userId,
      conversation_id: input.conversationId ?? null,
      reason,
      urgency,
    },
    select: { reference_number: true, status: true, created_at: true },
  });
}

export async function listEscalations(userId: string) {
  return prisma.legalEscalationRequest.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
}
