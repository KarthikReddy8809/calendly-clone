import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import type { EmailContent } from './email-layout.js';
import {
  buildBookingNotificationEmail,
  type BookingNotificationData,
} from './booking-notification.template.js';
import {
  buildBookingConfirmationEmail,
  type BookingConfirmationData,
} from './booking-confirmation.template.js';
import {
  buildHostCancellationEmail,
  buildInviteeCancellationEmail,
  type MeetingCancelledData,
} from './meeting-cancelled.template.js';
import { buildWelcomeEmail, type WelcomeEmailData } from './welcome.template.js';
import { buildInvitationEmail, type InvitationEmailData } from './invitation.template.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

type OutgoingEmail = EmailContent & {
  to: string;
  replyTo?: string;
  /** Short name for logs, e.g. "booking-confirmation". */
  kind: string;
};

/** True when EMAIL_USER and EMAIL_PASS are set, so mail can actually be sent. */
export function isEmailConfigured(): boolean {
  return getTransporter() !== null;
}

/**
 * Sends each email independently and never throws: an email failure must not
 * turn a booking or cancellation that already committed into a 500. Failures
 * are logged with the email kind so they can be traced. Resolves to one
 * boolean per email: true when it was handed to the mail server.
 */
async function deliver(emails: OutgoingEmail[]): Promise<boolean[]> {
  const mailer = getTransporter();
  if (!mailer) {
    logger.debug('Skipping emails: EMAIL_USER/EMAIL_PASS not configured', {
      kinds: emails.map((e) => e.kind),
    });
    return emails.map(() => false);
  }

  const results = await Promise.allSettled(
    emails.map((email) =>
      mailer.sendMail({
        from: `Calendly <${env.EMAIL_USER}>`,
        to: email.to,
        replyTo: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    ),
  );

  return results.map((result, index) => {
    if (result.status === 'rejected') {
      logger.warn('Failed to send email', {
        kind: emails[index]?.kind,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
      return false;
    }
    return true;
  });
}

/** After a booking: notify the host and confirm to the invitee. */
export async function sendBookingEmails(input: {
  host: BookingNotificationData;
  invitee: BookingConfirmationData;
}): Promise<void> {
  await deliver([
    {
      kind: 'booking-notification',
      to: input.host.hostEmail,
      replyTo: input.host.inviteeEmail,
      ...buildBookingNotificationEmail(input.host),
    },
    {
      kind: 'booking-confirmation',
      to: input.invitee.inviteeEmail,
      replyTo: input.invitee.hostEmail,
      ...buildBookingConfirmationEmail(input.invitee),
    },
  ]);
}

/** After the host cancels: tell the invitee and send the host a copy. */
export async function sendCancellationEmails(input: MeetingCancelledData): Promise<void> {
  await deliver([
    {
      kind: 'cancellation-invitee',
      to: input.inviteeEmail,
      replyTo: input.hostEmail,
      ...buildInviteeCancellationEmail(input),
    },
    {
      kind: 'cancellation-host',
      to: input.hostEmail,
      ...buildHostCancellationEmail(input),
    },
  ]);
}

/** After a host signs up. */
export async function sendWelcomeEmail(input: WelcomeEmailData): Promise<void> {
  await deliver([{ kind: 'welcome', to: input.hostEmail, ...buildWelcomeEmail(input) }]);
}

/**
 * Host-initiated invitations: one email per recipient, so invitees never see
 * each other's addresses. Returns which addresses were sent and which failed.
 */
export async function sendInvitationEmails(
  recipients: string[],
  input: InvitationEmailData,
): Promise<{ sent: string[]; failed: string[] }> {
  const content = buildInvitationEmail(input);
  const results = await deliver(
    recipients.map((to) => ({ kind: 'invitation', to, replyTo: input.hostEmail, ...content })),
  );
  return {
    sent: recipients.filter((_, i) => results[i]),
    failed: recipients.filter((_, i) => !results[i]),
  };
}
