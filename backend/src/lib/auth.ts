import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../db';
import { sendEmail } from './email';

/**
 * Better Auth — the single authentication authority for My Rights.
 *
 * Identity/sessions live in Neon via Prisma. The mobile app and web app are
 * both clients of this server. Authorization is derived downstream from the
 * Better Auth session, never from client-supplied identity.
 */

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error('[auth] BETTER_AUTH_SECRET is required.');
}

const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT ?? 8080}`;
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/**
 * Test/observability hook: captures the most recent verification and password
 * reset tokens so integration tests can exercise the email flows without a
 * configured SMTP server. Never used to make authorization decisions.
 */
export const authTestHooks = {
  lastVerificationToken: null as string | null,
  lastResetToken: null as string | null,
};

export const auth = betterAuth({
  appName: 'My Rights',
  baseURL,
  secret,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      authTestHooks.lastResetToken = token;
      await sendEmail({
        to: user.email,
        subject: 'Reset your My Rights password',
        text:
          `Use the link below to reset your My Rights password.\n\n${url}\n\n` +
          `This link expires soon and can only be used once. If you did not request this, you can ignore this email.`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      authTestHooks.lastVerificationToken = token;
      await sendEmail({
        to: user.email,
        subject: 'Verify your My Rights email',
        text:
          `Verify your email to finish creating your My Rights account.\n\n${url}\n\n` +
          `This link expires soon and can only be used once.`,
      });
    },
  },

  password: {
    minLength: 8,
  },

  // Google OAuth is enabled only once credentials are present (env vars), so the
  // server still starts locally without a Google client configured.
  ...(googleConfigured
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        },
      }
    : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },

  trustedOrigins: [
    'myrights://',
    'exp://',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
  ],
});
