import { prisma } from '../db';
import { HttpError } from '../authz';

/**
 * Terms/Privacy consent — recorded server-side against the authenticated user.
 * Append-oriented: a new (terms_version, privacy_version) pair adds a new row;
 * re-recording the same pair is idempotent. Historical records are never
 * overwritten or deleted.
 */
export async function recordConsent(
  userId: string,
  terms_version: string,
  privacy_version: string,
): Promise<void> {
  if (typeof terms_version !== 'string' || !terms_version.trim()) {
    throw new HttpError(400, 'Terms version is required.');
  }
  if (typeof privacy_version !== 'string' || !privacy_version.trim()) {
    throw new HttpError(400, 'Privacy version is required.');
  }

  await prisma.privacyConsent.upsert({
    where: {
      user_id_terms_version_privacy_version: {
        user_id: userId,
        terms_version: terms_version.trim(),
        privacy_version: privacy_version.trim(),
      },
    },
    create: {
      user_id: userId,
      terms_version: terms_version.trim(),
      privacy_version: privacy_version.trim(),
      source: 'mobile_signup',
    },
    update: {},
  });
}

export async function getConsents(userId: string) {
  return prisma.privacyConsent.findMany({
    where: { user_id: userId },
    orderBy: { accepted_at: 'desc' },
    select: { terms_version: true, privacy_version: true, accepted_at: true, source: true },
  });
}
