import { prisma } from '../db';
import { HttpError } from '../authz';

const CURRENT_TERMS_VERSION = process.env.TERMS_VERSION ?? '2026-09-18';
const CURRENT_PRIVACY_VERSION = process.env.PRIVACY_POLICY_VERSION ?? '2026-09-18';

export async function recordConsent(
  userId: string,
  terms_version: string,
  privacy_version: string,
): Promise<void> {
  if (terms_version !== CURRENT_TERMS_VERSION || privacy_version !== CURRENT_PRIVACY_VERSION) {
    throw new HttpError(409, 'The current Terms of Service and Privacy Policy must be accepted.');
  }

  await prisma.privacyConsent.upsert({
    where: {
      user_id_terms_version_privacy_version: {
        user_id: userId,
        terms_version: CURRENT_TERMS_VERSION,
        privacy_version: CURRENT_PRIVACY_VERSION,
      },
    },
    create: {
      user_id: userId,
      terms_version: CURRENT_TERMS_VERSION,
      privacy_version: CURRENT_PRIVACY_VERSION,
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
