import { prisma } from '../db';
import { HttpError } from '../authz';
import { oneOf, optString, reqString } from '../lib/validate';

// Every query below is scoped by the user id from the session. A row that
// belongs to someone else behaves exactly like a row that does not exist (404).

export async function getStats(userId: string) {
  const [consultations, enquiries, saved_rights] = await Promise.all([
    prisma.chatSession.count({ where: { user_id: userId } }),
    prisma.enquiry.count({ where: { user_id: userId } }),
    prisma.savedRight.count({ where: { user_id: userId } }),
  ]);
  return { consultations, enquiries, saved_rights };
}

export async function listSavedRights(userId: string) {
  return prisma.savedRight.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' } });
}

export async function saveRight(userId: string, input: Record<string, unknown>) {
  const data = {
    source_type: reqString(input.source_type, 'source_type', 40),
    source_id: reqString(input.source_id, 'source_id', 120),
    title: reqString(input.title, 'title', 300),
    citation: optString(input.citation, 'citation', 300),
    summary: optString(input.summary, 'summary', 2000),
  };
  // Saving the same right twice is not an error; it just returns the existing row.
  return prisma.savedRight.upsert({
    where: { user_id_source_type_source_id: { user_id: userId, source_type: data.source_type, source_id: data.source_id } },
    create: { user_id: userId, ...data },
    update: {},
  });
}

export async function deleteSavedRight(userId: string, id: string) {
  const result = await prisma.savedRight.deleteMany({ where: { id, user_id: userId } });
  if (result.count === 0) throw new HttpError(404, 'Saved right not found.');
}

export async function listDataRequests(userId: string) {
  return prisma.dataRequest.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' } });
}

export async function createDataRequest(userId: string, input: Record<string, unknown>) {
  const request_type = oneOf(input.request_type, ['export', 'deletion'] as const, 'request_type');
  const details = optString(input.details, 'details', 2000);
  // One open request of each type at a time; repeat taps return the existing one.
  const open = await prisma.dataRequest.findFirst({
    where: { user_id: userId, request_type, status: { in: ['pending', 'in_progress'] } },
  });
  if (open) return open;
  return prisma.dataRequest.create({ data: { user_id: userId, request_type, details } });
}

export async function createReport(userId: string, input: Record<string, unknown>) {
  const recent = await prisma.userReport.count({
    where: { user_id: userId, created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  if (recent >= 10) throw new HttpError(429, 'Too many reports today. Please try again tomorrow.');
  return prisma.userReport.create({
    data: {
      user_id: userId,
      category: reqString(input.category, 'category', 60),
      message: reqString(input.message, 'message', 4000),
      context_type: optString(input.context_type, 'context_type', 60),
      context_id: optString(input.context_id, 'context_id', 120),
    },
  });
}

/** Deletes the account and, through cascading foreign keys, everything the person owns. */
export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}

// Daily AI allowance per feature. The AI gateway increments `used`; this only reads.
const DAILY_LIMITS = { chat: 30, document_analyze: 5, document_generate: 5 } as const;

export async function getUsage(userId: string) {
  const day = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  const rows = await prisma.usageCounter.findMany({ where: { user_id: userId, day } });
  const used = new Map(rows.map((r) => [r.feature, r.used]));
  return {
    plan: 'free' as const,
    daily: (Object.keys(DAILY_LIMITS) as Array<keyof typeof DAILY_LIMITS>).map((feature) => {
      const u = used.get(feature) ?? 0;
      const limit = DAILY_LIMITS[feature];
      return { feature, used: u, limit, remaining: Math.max(0, limit - u) };
    }),
  };
}
