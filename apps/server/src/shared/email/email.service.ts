import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import {
  buildBookingNotificationEmail,
  type BookingNotificationData,
} from './booking-notification.template.js';

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

export async function sendBookingNotificationEmail(input: BookingNotificationData): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) {
    logger.debug('Skipping booking notification email — EMAIL_USER/EMAIL_PASS not configured');
    return;
  }

  const { subject, text, html } = buildBookingNotificationEmail(input);

  await mailer.sendMail({
    from: env.EMAIL_USER,
    to: input.hostEmail,
    subject,
    text,
    html,
  });
}
