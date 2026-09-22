import { prisma } from '../db';

// Public reference data. These mirror the Supabase RLS policies that granted
// `select` to anon/authenticated and no writes from the client.

export function getConstitution() {
  return prisma.constitutionChapter.findMany({
    orderBy: { chapter_number: 'asc' },
    include: { sections: { orderBy: { id: 'asc' } } },
  });
}

export function getLegalAidCenters() {
  return prisma.legalAidCenter.findMany({
    include: { organization: { select: { type: true } } },
  });
}

export function getLawyers() {
  return prisma.lawyer.findMany({ orderBy: { rating: 'desc' } });
}

export function getTemplates() {
  return prisma.legalTemplate.findMany();
}

// Only verified sources are public-readable (RLS: `verification_status = 'verified'`).
export function getVerifiedLegalSources() {
  return prisma.legalSource.findMany({ where: { verification_status: 'verified' } });
}
