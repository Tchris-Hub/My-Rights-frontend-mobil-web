import { NextFunction, Request, Response } from 'express';
import { auth } from './lib/auth';
import { prisma } from './db';

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export type AuthedRequest = Request & { userId: string };

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

function getRequestHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return headers;
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  auth.api
    .getSession({ headers: getRequestHeaders(req) })
    .then((result) => {
      const session = result?.session;
      if (!session) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }
      (req as AuthedRequest).userId = session.userId;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Authentication required.' });
    });
}

export async function requireConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as AuthedRequest).userId;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const termsVersion = process.env.TERMS_VERSION ?? '2026-09-18';
  const privacyVersion = process.env.PRIVACY_POLICY_VERSION ?? '2026-09-18';

  try {
    const consent = await prisma.privacyConsent.findUnique({
      where: {
        user_id_terms_version_privacy_version: {
          user_id: userId,
          terms_version: termsVersion,
          privacy_version: privacyVersion,
        },
      },
      select: { id: true },
    });

    if (!consent) {
      res.status(428).json({ error: 'Current Terms of Service and Privacy Policy consent is required.' });
      return;
    }

    next();
  } catch {
    res.status(503).json({ error: 'Consent status could not be verified safely.' });
  }
}
