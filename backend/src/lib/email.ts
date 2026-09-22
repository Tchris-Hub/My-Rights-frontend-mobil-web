import nodemailer from 'nodemailer';

/**
 * Server-side email via SMTP. Credentials come only from server env vars —
 * never the mobile bundle, Expo config, or source control.
 *
 * Fails SOFT: a transient email failure must not block account creation or a
 * password-reset request (the user can resend). Failures are logged loudly for
 * operators, but never surface SMTP details to the client.
 */

export interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const host = process.env.SMTP_HOST ?? '';
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER ?? '';
const pass = process.env.SMTP_PASS ?? '';
const from = process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? 'no-reply@myrights.ng';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
  return transporter;
}

export function isEmailConfigured(): boolean {
  return Boolean(host && user && pass);
}

export async function sendEmail({ to, subject, text, html }: SendEmailArgs): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.error('[email] SMTP not configured — skipped send:', subject);
    return false;
  }
  try {
    await getTransporter().sendMail({ from, to, subject, text, html });
    return true;
  } catch (err) {
    console.error('[email] send failed:', subject, err instanceof Error ? err.message : err);
    return false;
  }
}
