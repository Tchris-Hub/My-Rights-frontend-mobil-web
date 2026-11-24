import { prisma } from '../db';
import { HttpError } from '../authz';
import { MatchFilters, rank } from '../matching/score';
import { TRANSITIONS } from '../lib/enquiryRules';
import { newReference, oneOf, optString, reqString, stringList } from '../lib/validate';

// Directory rules:
//  - Only VERIFIED professionals and firms are ever listed, matched or enquired to.
//    Verification is an admin action; a person cannot verify themselves.
//  - A person's own enquiries are visible to them; received enquiries are visible
//    only to the professional (or a member of the firm) they were addressed to.
//  - Before an enquiry is accepted the professional sees the requester's first
//    name only. Full name appears after they accept.

const ROLES = ['practising_lawyer', 'law_student', 'paralegal', 'clinic_staff'] as const;

type Prof = Awaited<ReturnType<typeof loadVerifiedProfessionals>>[number];

async function loadVerifiedProfessionals(role?: string) {
  return prisma.professional.findMany({
    where: { verification_status: 'verified', ...(role ? { role } : {}) },
    include: { firms: { include: { firm: { select: { id: true, name: true, location: true } } } } },
  });
}

function shapeProfessional(p: Prof) {
  return {
    id: p.id,
    display_name: p.display_name,
    role: p.role,
    bio: p.bio,
    location: p.location,
    practice_areas: p.practice_areas,
    service_areas: p.service_areas,
    languages: p.languages,
    availability: p.availability,
    fee_band: p.fee_band,
    verification_status: p.verification_status,
    verified_at: p.verified_at,
    firms: p.firms.map((m) => ({ id: m.firm.id, name: m.firm.name, location: m.firm.location, member_role: m.member_role })),
  };
}

const text = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 80) : undefined);

export function filtersFromQuery(q: Record<string, unknown>): MatchFilters {
  return {
    practiceArea: text(q.practice_area),
    location: text(q.location),
    serviceArea: text(q.service_area),
    language: text(q.language),
    feeBand: text(q.fee_band),
  };
}

export async function listProfessionals(q: Record<string, unknown>) {
  const rows = await loadVerifiedProfessionals(text(q.role));
  const filters = filtersFromQuery(q);
  return rank(rows, filters, (r) => r.display_name).map(shapeProfessional);
}

export async function matchProfessionals(q: Record<string, unknown>) {
  const rows = await loadVerifiedProfessionals(text(q.role));
  return rank(rows, filtersFromQuery(q), (r) => r.display_name).map((r) => ({
    ...shapeProfessional(r),
    matched_attributes: r.matched_attributes,
    match_reasons: r.match_reasons,
  }));
}

async function loadVerifiedFirms() {
  return prisma.firm.findMany({
    where: { verification_status: 'verified' },
    include: {
      members: {
        where: { professional: { verification_status: 'verified' } },
        include: { professional: { select: { id: true, display_name: true, role: true, practice_areas: true } } },
      },
    },
  });
}

function shapeFirm(f: Awaited<ReturnType<typeof loadVerifiedFirms>>[number]) {
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    location: f.location,
    practice_areas: f.practice_areas,
    service_areas: f.service_areas,
    languages: f.languages,
    fee_band: f.fee_band,
    verification_status: f.verification_status,
    verified_at: f.verified_at,
    professionals: f.members.map((m) => ({
      id: m.professional.id,
      display_name: m.professional.display_name,
      role: m.professional.role,
      practice_areas: m.professional.practice_areas,
    })),
  };
}

export async function listFirms(q: Record<string, unknown>) {
  return rank(await loadVerifiedFirms(), filtersFromQuery(q), (f) => f.name).map(shapeFirm);
}

export async function matchFirms(q: Record<string, unknown>) {
  return rank(await loadVerifiedFirms(), filtersFromQuery(q), (f) => f.name).map((f) => ({
    ...shapeFirm(f),
    matched_attributes: f.matched_attributes,
    match_reasons: f.match_reasons,
  }));
}

// ---- A professional's own profile -----------------------------------------

export async function getOwnProfessional(userId: string) {
  const p = await prisma.professional.findUnique({
    where: { user_id: userId },
    include: { firms: { include: { firm: { select: { id: true, name: true, location: true } } } } },
  });
  if (!p) throw new HttpError(404, 'No professional profile yet.');
  return shapeProfessional(p);
}

export async function upsertOwnProfessional(userId: string, input: Record<string, unknown>) {
  const data = {
    role: oneOf(input.role, ROLES, 'role'),
    display_name: reqString(input.display_name, 'display_name', 120),
    bio: optString(input.bio, 'bio', 2000),
    location: optString(input.location, 'location', 120),
    practice_areas: stringList(input.practice_areas, 'practice_areas'),
    service_areas: stringList(input.service_areas, 'service_areas'),
    languages: stringList(input.languages, 'languages'),
    availability: optString(input.availability, 'availability', 200),
    fee_band: optString(input.fee_band, 'fee_band', 60),
  };
  // verification_status is never taken from the request: new profiles start
  // unverified and only an admin action can change that.
  const p = await prisma.professional.upsert({
    where: { user_id: userId },
    create: { user_id: userId, ...data },
    update: data,
    include: { firms: { include: { firm: { select: { id: true, name: true, location: true } } } } },
  });
  return shapeProfessional(p);
}

// ---- Enquiries --------------------------------------------------------------

const ENQUIRY_INCLUDE = {
  professional: { select: { id: true, display_name: true, role: true } },
  firm: { select: { id: true, name: true } },
  user: { select: { name: true } },
} as const;

type EnquiryRow = Awaited<ReturnType<typeof prisma.enquiry.findMany<{ include: typeof ENQUIRY_INCLUDE }>>>[number];

function shapeEnquiry(e: EnquiryRow, forRecipient: boolean) {
  const base = {
    id: e.id,
    reference_number: e.reference_number,
    message: e.message,
    practice_area: e.practice_area,
    status: e.status,
    response_message: e.response_message,
    created_at: e.created_at,
    updated_at: e.updated_at,
    professional: e.professional,
    firm: e.firm,
  };
  if (!forRecipient) return base;
  const fullName = e.user.name?.trim() || 'Client';
  return { ...base, requester: { name: e.status === 'accepted' || e.status === 'closed' ? fullName : fullName.split(/\s+/)[0] } };
}

export async function createEnquiry(userId: string, input: Record<string, unknown>) {
  const message = reqString(input.message, 'message', 4000);
  const practice_area = optString(input.practice_area, 'practice_area', 80);
  const professional_id = optString(input.professional_id, 'professional_id', 80);
  const firm_id = optString(input.firm_id, 'firm_id', 80);
  if (!!professional_id === !!firm_id) throw new HttpError(400, 'Choose either a professional or a firm.');

  if (professional_id) {
    const target = await prisma.professional.findFirst({
      where: { id: professional_id, verification_status: 'verified' },
      select: { user_id: true },
    });
    if (!target) throw new HttpError(404, 'Professional not found.');
    if (target.user_id === userId) throw new HttpError(400, 'You cannot send an enquiry to yourself.');
  } else {
    const firm = await prisma.firm.findFirst({ where: { id: firm_id!, verification_status: 'verified' }, select: { id: true } });
    if (!firm) throw new HttpError(404, 'Firm not found.');
  }

  const waiting = await prisma.enquiry.count({ where: { user_id: userId, status: 'pending' } });
  if (waiting >= 10) throw new HttpError(429, 'You have several enquiries waiting. Wait for replies before sending more.');

  const created = await prisma.enquiry.create({
    data: { reference_number: newReference('EQ'), user_id: userId, professional_id, firm_id, message, practice_area },
    include: ENQUIRY_INCLUDE,
  });
  return shapeEnquiry(created, false);
}

export async function listEnquiries(userId: string, view: string | undefined) {
  if (view === 'received') {
    const mine = await prisma.professional.findUnique({
      where: { user_id: userId },
      select: { id: true, firms: { select: { firm_id: true } } },
    });
    if (!mine) return [];
    const rows = await prisma.enquiry.findMany({
      where: { OR: [{ professional_id: mine.id }, { firm_id: { in: mine.firms.map((f) => f.firm_id) } }] },
      orderBy: { created_at: 'desc' },
      include: ENQUIRY_INCLUDE,
    });
    return rows.map((r) => shapeEnquiry(r, true));
  }
  const rows = await prisma.enquiry.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: ENQUIRY_INCLUDE,
  });
  return rows.map((r) => shapeEnquiry(r, false));
}

export async function updateEnquiry(userId: string, id: string, input: Record<string, unknown>) {
  const next = oneOf(input.status, ['accepted', 'declined', 'closed'] as const, 'status');
  const response_message = optString(input.response_message, 'response_message', 2000);

  const mine = await prisma.professional.findUnique({
    where: { user_id: userId },
    select: { id: true, verification_status: true, firms: { select: { firm_id: true } } },
  });
  // Not a professional, or not addressed to them: indistinguishable from "not found".
  if (!mine || mine.verification_status !== 'verified') throw new HttpError(404, 'Enquiry not found.');

  const enquiry = await prisma.enquiry.findFirst({
    where: { id, OR: [{ professional_id: mine.id }, { firm_id: { in: mine.firms.map((f) => f.firm_id) } }] },
    select: { id: true, status: true },
  });
  if (!enquiry) throw new HttpError(404, 'Enquiry not found.');
  if (!TRANSITIONS[enquiry.status].includes(next)) {
    throw new HttpError(409, `An enquiry that is ${enquiry.status} cannot be marked ${next}.`);
  }

  // Compare-and-set on the old status so two quick taps cannot both succeed.
  const result = await prisma.enquiry.updateMany({
    where: { id, status: enquiry.status },
    data: { status: next, ...(response_message ? { response_message } : {}) },
  });
  if (result.count === 0) throw new HttpError(409, 'This enquiry was just updated. Refresh and try again.');
  const updated = await prisma.enquiry.findUniqueOrThrow({ where: { id }, include: ENQUIRY_INCLUDE });
  return shapeEnquiry(updated, true);
}
