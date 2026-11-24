import { Router } from 'express';
import { asyncHandler, requireUser, requireConsent, AuthedRequest } from './authz';
import * as chat from './services/chat';
import * as escalation from './services/escalation';
import * as legal from './services/legal';
import * as profile from './services/profile';
import * as consent from './services/consent';
import * as account from './services/account';
import * as directory from './services/directory';
import * as cases from './services/cases';

export function buildRoutes(): Router {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ ok: true }));

  router.get('/api/users/me', requireUser, asyncHandler(async (req, res) => {
    res.json(await profile.getProfile((req as AuthedRequest).userId));
  }));
  router.patch('/api/users/me', requireUser, asyncHandler(async (req, res) => {
    res.json(await profile.updateProfile((req as AuthedRequest).userId, req.body ?? {}));
  }));
  router.delete('/api/users/me', requireUser, asyncHandler(async (req, res) => {
    await account.deleteAccount((req as AuthedRequest).userId);
    res.status(204).end();
  }));

  // ---- Account: saved rights, data requests, reports, usage ----------------
  const uid = (req: unknown): string => (req as AuthedRequest).userId;
  router.get('/api/account/stats', requireUser, asyncHandler(async (req, res) => {
    res.json(await account.getStats(uid(req)));
  }));
  router.get('/api/account/saved-rights', requireUser, asyncHandler(async (req, res) => {
    res.json(await account.listSavedRights(uid(req)));
  }));
  router.post('/api/account/saved-rights', requireUser, asyncHandler(async (req, res) => {
    res.status(201).json(await account.saveRight(uid(req), req.body ?? {}));
  }));
  router.delete('/api/account/saved-rights/:id', requireUser, asyncHandler(async (req, res) => {
    await account.deleteSavedRight(uid(req), req.params.id);
    res.status(204).end();
  }));
  router.get('/api/account/data-requests', requireUser, asyncHandler(async (req, res) => {
    res.json(await account.listDataRequests(uid(req)));
  }));
  router.post('/api/account/data-requests', requireUser, asyncHandler(async (req, res) => {
    res.status(201).json(await account.createDataRequest(uid(req), req.body ?? {}));
  }));
  router.post('/api/account/reports', requireUser, asyncHandler(async (req, res) => {
    res.status(201).json(await account.createReport(uid(req), req.body ?? {}));
  }));
  router.get('/api/usage', requireUser, asyncHandler(async (req, res) => {
    res.json(await account.getUsage(uid(req)));
  }));

  // Consent is the one authenticated endpoint that does not require an
  // existing consent record; it establishes the current version after signup.
  router.post('/api/consent', requireUser, asyncHandler(async (req, res) => {
    const { terms_version, privacy_version } = req.body ?? {};
    await consent.recordConsent((req as AuthedRequest).userId, terms_version, privacy_version);
    res.status(201).json({ ok: true });
  }));
  router.get('/api/consent', requireUser, asyncHandler(async (req, res) => {
    res.json(await consent.getConsents((req as AuthedRequest).userId));
  }));

  router.post('/api/chat/sessions', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.status(201).json(await chat.createSession((req as AuthedRequest).userId, req.body?.title));
  }));
  router.get('/api/chat/sessions', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await chat.listSessions((req as AuthedRequest).userId));
  }));
  router.get('/api/chat/sessions/:id', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await chat.getSession((req as AuthedRequest).userId, req.params.id));
  }));
  router.delete('/api/chat/sessions/:id', requireUser, requireConsent, asyncHandler(async (req, res) => {
    await chat.deleteSession((req as AuthedRequest).userId, req.params.id);
    res.status(204).end();
  }));
  router.get('/api/chat/sessions/:id/messages', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await chat.listMessages((req as AuthedRequest).userId, req.params.id));
  }));
  router.post('/api/chat/sessions/:id/messages', requireUser, requireConsent, asyncHandler(async (req, res) => {
    const role = req.body?.role === 'assistant' ? 'assistant' : 'user';
    res.status(201).json(
      await chat.addMessage((req as AuthedRequest).userId, req.params.id, role, req.body?.content),
    );
  }));

  // AI generation remains intentionally behind a distinct next objective.
  // These routes establish the authenticated API boundary without rebuilding
  // the AI security/provider layer during the auth/data migration.
  const aiMigrationPending = asyncHandler(async (_req, res) => {
    res.status(503).json({ error: 'AI gateway migration is the next distinct objective.' });
  });
  router.post('/api/ai/chat', requireUser, requireConsent, aiMigrationPending);
  router.post('/api/ai/document/analyze', requireUser, requireConsent, aiMigrationPending);
  router.post('/api/ai/document/generate', requireUser, requireConsent, aiMigrationPending);

  router.post('/api/escalations', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.status(201).json(await escalation.createEscalation((req as AuthedRequest).userId, req.body ?? {}));
  }));
  router.get('/api/escalations', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await escalation.listEscalations((req as AuthedRequest).userId));
  }));

  // ---- Directory: verified professionals and firms, enquiries ----------------
  router.get('/api/legal/professionals/match', requireUser, asyncHandler(async (req, res) => {
    res.json(await directory.matchProfessionals(req.query));
  }));
  router.get('/api/legal/professionals', requireUser, asyncHandler(async (req, res) => {
    res.json(await directory.listProfessionals(req.query));
  }));
  router.get('/api/legal/firms/match', requireUser, asyncHandler(async (req, res) => {
    res.json(await directory.matchFirms(req.query));
  }));
  router.get('/api/legal/firms', requireUser, asyncHandler(async (req, res) => {
    res.json(await directory.listFirms(req.query));
  }));
  router.post('/api/legal/enquiries', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.status(201).json(await directory.createEnquiry(uid(req), req.body ?? {}));
  }));
  router.get('/api/legal/enquiries', requireUser, requireConsent, asyncHandler(async (req, res) => {
    const view = typeof req.query.view === 'string' ? req.query.view : undefined;
    res.json(await directory.listEnquiries(uid(req), view));
  }));
  router.patch('/api/legal/enquiries/:id', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await directory.updateEnquiry(uid(req), req.params.id, req.body ?? {}));
  }));
  router.get('/api/professionals/me', requireUser, asyncHandler(async (req, res) => {
    res.json(await directory.getOwnProfessional(uid(req)));
  }));
  router.put('/api/professionals/me', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await directory.upsertOwnProfessional(uid(req), req.body ?? {}));
  }));

  // ---- Intake: cases built from answered questions --------------------------
  router.get('/api/situations', asyncHandler(async (_req, res) => {
    res.json(cases.situations());
  }));
  router.post('/api/cases', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.status(201).json(await cases.createCase(uid(req), req.body ?? {}));
  }));
  router.get('/api/cases', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await cases.listCases(uid(req)));
  }));
  router.get('/api/cases/:id', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await cases.getCase(uid(req), req.params.id));
  }));
  router.post('/api/cases/:id/answers', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.status(201).json(await cases.answer(uid(req), req.params.id, req.body ?? {}));
  }));
  router.post('/api/cases/:id/finish', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await cases.finish(uid(req), req.params.id));
  }));
  router.get('/api/cases/:id/file', requireUser, requireConsent, asyncHandler(async (req, res) => {
    res.json(await cases.getFile(uid(req), req.params.id));
  }));

  router.get('/api/legal/constitution', asyncHandler(async (_req, res) => {
    res.json(await legal.getConstitution());
  }));
  router.get('/api/legal/aid-centers', asyncHandler(async (_req, res) => {
    res.json(await legal.getLegalAidCenters());
  }));
  router.get('/api/legal/lawyers', asyncHandler(async (_req, res) => {
    res.json(await legal.getLawyers());
  }));
  router.get('/api/legal/templates', asyncHandler(async (_req, res) => {
    res.json(await legal.getTemplates());
  }));
  router.get('/api/legal/sources', asyncHandler(async (_req, res) => {
    res.json(await legal.getVerifiedLegalSources());
  }));

  return router;
}
