import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export type BookingConfirmationEmail = {
  to: string;
  inviteeName: string;
  hostName: string;
  eventTitle: string;
  startTimeLabel: string;
  locationType: string;
};

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

export async function sendBookingConfirmationEmail(input: BookingConfirmationEmail): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) {
    logger.debug('Skipping booking confirmation email — EMAIL_USER/EMAIL_PASS not configured');
    return;
  }

  await mailer.sendMail({
    from: env.EMAIL_USER,
    to: input.to,
    subject: `Meeting Confirmation: ${input.eventTitle}`,
    text: `Hello ${input.inviteeName}, your meeting with ${input.hostName} has been confirmed for ${input.startTimeLabel}`,
  });
}
