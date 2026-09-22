import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { expo } from '@better-auth/expo';
import { prisma } from '../db';
import { sendEmail } from './email';

const TERMS_VERSION = process.env.TERMS_VERSION ?? '2026-09-18';
const PRIVACY_POLICY_VERSION = process.env.PRIVACY_POLICY_VERSION ?? '2026-09-18';

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error('[auth] BETTER_AUTH_SECRET is required.');
}

const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT ?? 8080}`;
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Test-only token capture. In non-test processes this is null and no auth token
// is retained in memory. It is never part of an API response or authorization.
export const authTestHooks =
  process.env.NODE_ENV === 'test'
    ? {
        lastVerificationToken: null as string | null,
        lastResetToken: null as string | null,
      }
    : null;

async function requireEmailDelivery(result: Promise<boolean>, operation: string): Promise<void> {
  const sent = await result;
  if (!sent) {
    throw new Error(`Authentication email could not be delivered for ${operation}.`);
  }
}

export const auth = betterAuth({
  appName: 'My Rights',
  baseURL,
  secret,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  plugins: [expo()],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      if (authTestHooks) authTestHooks.lastResetToken = token;
      await requireEmailDelivery(
        sendEmail({
          to: user.email,
          subject: 'Reset your My Rights password',
          text:
            `Use the link below to reset your My Rights password.\\n\\n${url}\\n\\n` +
            'This link expires soon and can only be used once. If you did not request this, you can ignore this email.',
        }),
        'password reset',
      );
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      if (authTestHooks) authTestHooks.lastVerificationToken = token;
      await requireEmailDelivery(
        sendEmail({
          to: user.email,
          subject: 'Verify your My Rights email',
          text:
            `Verify your email to finish creating your My Rights account.\\n\\n${url}\\n\\n` +
            'This link expires soon and can only be used once.',
        }),
        'email verification',
      );
    },
  },

  user: {
    additionalFields: {
      phone_number: {
        type: 'string',
        required: false,
        input: true,
        returned: true,
      },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await requireEmailDelivery(
          sendEmail({
            to: user.email,
            subject: 'Approve your My Rights email change',
            text: `Approve the requested change to ${newEmail}.\\n\\n${url}`,
          }),
          'email change approval',
        );
      },
    },
  },

  password: {
    minLength: 8,
  },

  ...(googleConfigured
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            requireEmailVerification: true,
          },
        },
      }
    : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },

  trustedOrigins: [
    'myrights://',
    ...(process.env.NODE_ENV === 'development' ? ['exp://', 'exp://**'] : []),
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
  ],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return;

      const body = ctx.body as Record<string, unknown> | undefined;
      if (
        body?.accept_terms !== true ||
        body?.terms_version !== TERMS_VERSION ||
        body?.privacy_version !== PRIVACY_POLICY_VERSION
      ) {
        throw new APIError('BAD_REQUEST', {
          message: 'You must accept the current Terms of Service and Privacy Policy before creating an account.',
        });
      }
    }),
  },
});
