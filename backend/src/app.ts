import express, { NextFunction, Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { buildRoutes } from './routes';

export const app = express();
app.disable('x-powered-by');

// CORS allow-list.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, cookie');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Better Auth handler — mounted before the JSON body parser so it reads the raw
// request body itself.
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json({ limit: '64kb' }));

app.use(buildRoutes());

// Fail-closed, sanitized error handler. Internal details never reach the client.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
    const { status, message } = err as { status: number; message: string };
    res.status(status).json({ error: message });
    return;
  }
  console.error('[api] unexpected error', err);
  res.status(500).json({ error: 'Request could not be completed safely.' });
});
