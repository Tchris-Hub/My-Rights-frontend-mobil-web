import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { prisma } from '../src/db';
import * as account from '../src/services/account';
import * as directory from '../src/services/directory';
import * as cases from '../src/services/cases';

// Integration tests: need a reachable Neon database (DATABASE_URL) with the
// 20261124000000 migration applied. Skipped otherwise.
const run = process.env.DATABASE_URL ? describe : describe.skip;

run('account, directory and intake isolation', () => {
  const ids: string[] = [];
  let client = '';
  let other = '';
  let lawyer = '';
  let lawyerProfile = '';
  let unverifiedProfile = '';

  beforeAll(async () => {
    const s = Date.now();
    const mk = async (name: string) =>
      (await prisma.user.create({ data: { email: `${name}-${s}@test.local`, name: `${name} Person` } })).id;
    client = await mk('client');
    other = await mk('other');
    lawyer = await mk('lawyer');
    const lawyer2 = await mk('lawyer2');
    ids.push(client, other, lawyer, lawyer2);

    lawyerProfile = (
      await prisma.professional.create({
        data: { user_id: lawyer, role: 'practising_lawyer', display_name: 'Ada Verified', practice_areas: ['Employment'], service_areas: [], languages: [], verification_status: 'verified' },
      })
    ).id;
    unverifiedProfile = (
      await prisma.professional.create({
        data: { user_id: lawyer2, role: 'practising_lawyer', display_name: 'Unverified Person', practice_areas: ['Employment'], service_areas: [], languages: [] },
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });

  it('saved rights are private and saving twice is idempotent', async () => {
    const a = await account.saveRight(client, { source_type: 'constitution', source_id: 's35', title: 'Right to liberty' });
    const b = await account.saveRight(client, { source_type: 'constitution', source_id: 's35', title: 'Right to liberty' });
    expect(b.id).toBe(a.id);
    expect((await account.listSavedRights(other)).length).toBe(0);
    await expect(account.deleteSavedRight(other, a.id)).rejects.toMatchObject({ status: 404 });
    await expect(account.deleteSavedRight(client, a.id)).resolves.toBeUndefined();
  });

  it('a repeat data request returns the open one instead of creating another', async () => {
    const first = await account.createDataRequest(client, { request_type: 'export' });
    const again = await account.createDataRequest(client, { request_type: 'export' });
    expect(again.id).toBe(first.id);
    expect((await account.listDataRequests(other)).length).toBe(0);
    await expect(account.createDataRequest(client, { request_type: 'sell' })).rejects.toMatchObject({ status: 400 });
  });

  it('only verified professionals are listed or can receive enquiries', async () => {
    const listed = await directory.listProfessionals({});
    expect(listed.some((p) => p.id === lawyerProfile)).toBe(true);
    expect(listed.some((p) => p.id === unverifiedProfile)).toBe(false);
    await expect(
      directory.createEnquiry(client, { professional_id: unverifiedProfile, message: 'Help' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('a professional cannot verify themselves through their own profile', async () => {
    const updated = await directory.upsertOwnProfessional(lawyer, {
      role: 'practising_lawyer',
      display_name: 'Ada Verified',
      verification_status: 'verified',
    });
    expect(updated.verification_status).toBe('verified'); // stays as set by admin, not by the request
    const fresh = await directory.upsertOwnProfessional(other, {
      role: 'law_student',
      display_name: 'New Student',
      verification_status: 'verified',
    });
    expect(fresh.verification_status).toBe('unverified');
  });

  it('enquiry flow: only the addressee can answer, in allowed steps, and sees a first name until accepted', async () => {
    const created = await directory.createEnquiry(client, { professional_id: lawyerProfile, message: 'I was sacked', practice_area: 'Employment' });
    expect(created.status).toBe('pending');
    await expect(directory.createEnquiry(lawyer, { professional_id: lawyerProfile, message: 'self' })).rejects.toMatchObject({ status: 400 });

    // Someone else, and the requester themselves, cannot act on it.
    await expect(directory.updateEnquiry(other, created.id, { status: 'accepted' })).rejects.toMatchObject({ status: 404 });
    await expect(directory.updateEnquiry(client, created.id, { status: 'accepted' })).rejects.toMatchObject({ status: 404 });

    const inbox = await directory.listEnquiries(lawyer, 'received');
    const seen = inbox.find((e) => e.id === created.id) as { requester: { name: string } };
    expect(seen.requester.name).toBe('client');

    await expect(directory.updateEnquiry(lawyer, created.id, { status: 'closed' })).rejects.toMatchObject({ status: 409 });
    const accepted = (await directory.updateEnquiry(lawyer, created.id, { status: 'accepted', response_message: 'Call me' })) as { requester: { name: string } };
    expect(accepted.requester.name).toBe('client Person');
    await directory.updateEnquiry(lawyer, created.id, { status: 'closed' });
    await expect(directory.updateEnquiry(lawyer, created.id, { status: 'accepted' })).rejects.toMatchObject({ status: 409 });

    expect((await directory.listEnquiries(other, undefined)).some((e) => e.id === created.id)).toBe(false);
  });

  it('cases: private to the owner, answers are validated, history is kept', async () => {
    const c = await cases.createCase(client, { situation: 'housing' });
    expect(c.next_question?.key).toBe('in_danger');
    await expect(cases.getCase(other, c.id)).rejects.toMatchObject({ status: 404 });
    await expect(cases.answer(other, c.id, { key: 'in_danger', value: 'no' })).rejects.toMatchObject({ status: 404 });

    await expect(cases.answer(client, c.id, { key: 'in_danger', value: 'maybe' })).rejects.toMatchObject({ status: 400 });
    await expect(cases.answer(client, c.id, { key: 'locked_out', value: 'yes' })).rejects.toMatchObject({ status: 400 }); // not applicable yet
    await expect(cases.answer(client, c.id, { key: 'nope', value: 'x' })).rejects.toMatchObject({ status: 400 });

    const afterDanger = await cases.answer(client, c.id, { key: 'in_danger', value: 'yes' });
    expect(afterDanger.gate.decision).toBe('refer_now');
    await cases.answer(client, c.id, { key: 'state', value: 'Lagos' });
    await cases.answer(client, c.id, { key: 'state', value: 'Nasarawa' });
    const file = await cases.getFile(client, c.id);
    expect(file.facts.find((f) => f.label === 'State')).toMatchObject({ value: 'Nasarawa', corrected: true });
    await expect(cases.getFile(other, c.id)).rejects.toMatchObject({ status: 404 });
  });

  it('deleting an account removes everything the person owned', async () => {
    const gone = await prisma.user.create({ data: { email: `gone-${Date.now()}@test.local`, name: 'Gone' } });
    await account.saveRight(gone.id, { source_type: 'x', source_id: '1', title: 'T' });
    await cases.createCase(gone.id, { situation: 'general' });
    await account.deleteAccount(gone.id);
    expect(await prisma.savedRight.count({ where: { user_id: gone.id } })).toBe(0);
    expect(await prisma.case.count({ where: { user_id: gone.id } })).toBe(0);
  });
});
