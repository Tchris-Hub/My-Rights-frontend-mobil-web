import { Router } from 'express';
import { asyncHandler, requireUser, AuthedRequest } from './authz';
import * as chat from './services/chat';
import * as escalation from './services/escalation';
import * as legal from './services/legal';
import * as profile from './services/profile';
import * as consent from './services/consent';

export function buildRoutes(): Router {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ ok: true }));

  // Profile (authenticated; ownership scoped to the caller).
  router.get('/api/users/me', requireUser, asyncHandler(async (req, res) => {
    res.json(await profile.getProfile((req as AuthedRequest).userId));
  }));
  router.patch('/api/users/me', requireUser, asyncHandler(async (req, res) => {
    res.json(await profile.updateProfile((req as AuthedRequest).userId, req.body ?? {}));
  }));

  // Terms/Privacy consent (authenticated; recorded server-side against the caller).
  router.post('/api/consent', requireUser, asyncHandler(async (req, res) => {
    const { terms_version, privacy_version } = req.body ?? {};
    await consent.recordConsent((req as AuthedRequest).userId, terms_version, privacy_version);
    res.status(201).json({ ok: true });
  }));
  router.get('/api/consent', requireUser, asyncHandler(async (req, res) => {
    res.json(await consent.getConsents((req as AuthedRequest).userId));
  }));

  // Chat (authenticated).
  router.post('/api/chat/sessions', requireUser, asyncHandler(async (req, res) => {
    res.status(201).json(await chat.createSession((req as AuthedRequest).userId, req.body?.title));
  }));
  router.get('/api/chat/sessions', requireUser, asyncHandler(async (req, res) => {
    res.json(await chat.listSessions((req as AuthedRequest).userId));
  }));
  router.get('/api/chat/sessions/:id', requireUser, asyncHandler(async (req, res) => {
    res.json(await chat.getSession((req as AuthedRequest).userId, req.params.id));
  }));
  router.delete('/api/chat/sessions/:id', requireUser, asyncHandler(async (req, res) => {
    await chat.deleteSession((req as AuthedRequest).userId, req.params.id);
    res.status(204).end();
  }));
  router.get('/api/chat/sessions/:id/messages', requireUser, asyncHandler(async (req, res) => {
    res.json(await chat.listMessages((req as AuthedRequest).userId, req.params.id));
  }));
  router.post('/api/chat/sessions/:id/messages', requireUser, asyncHandler(async (req, res) => {
    const role = req.body?.role === 'assistant' ? 'assistant' : 'user';
    res.status(201).json(
      await chat.addMessage((req as AuthedRequest).userId, req.params.id, role, req.body?.content),
    );
  }));

  // Escalation (authenticated; no update/delete endpoints — matches RLS).
  router.post('/api/escalations', requireUser, asyncHandler(async (req, res) => {
    res.status(201).json(await escalation.createEscalation((req as AuthedRequest).userId, req.body ?? {}));
  }));
  router.get('/api/escalations', requireUser, asyncHandler(async (req, res) => {
    res.json(await escalation.listEscalations((req as AuthedRequest).userId));
  }));

  // Legal reference data (public read only).
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
