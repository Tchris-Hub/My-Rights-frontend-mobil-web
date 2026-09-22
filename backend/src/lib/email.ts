import nodemailer from 'nodemailer';

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
  return Boolean(host && user && pass && from);
}

/**
 * Returns true only when Nodemailer successfully hands the message to the
 * configured SMTP transport. Authentication flows treat false as a failed
 * security-sensitive operation; SMTP details never reach the client.
 *
 * This intentionally does not claim that mailbox delivery has occurred.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailArgs): Promise<boolean> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[email] SMTP is not configured; authentication email was not sent.');
    }
    return false;
  }

  try {
    await getTransporter().sendMail({ from, to, subject, text, html });
    return true;
  } catch (err) {
    console.error(
      '[email] authentication email handoff failed:',
      err instanceof Error ? err.message : 'unknown error',
    );
    return false;
  }
}
