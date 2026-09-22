import { NextFunction, Request, Response } from 'express';
import { auth } from './lib/auth';

/** A controlled HTTP error carrying a client-safe message and status. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
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

/**
 * Authorization seam — derives identity from the Better Auth session.
 *
 * The client never supplies a user id. `userId` is resolved server-side from
 * the session cookie/token attached to the request, and every service query is
 * scoped by it. Unauthenticated or invalid sessions fail closed (401).
 */
export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }

  auth.api
    .getSession({ headers })
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
