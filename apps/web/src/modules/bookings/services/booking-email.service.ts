import emailjs from '@emailjs/browser';
import type { BookingConfirmation } from '@calendly/shared';
import { config } from '@/lib/config';
import { dayjs } from '@/lib/dayjs';
import { getTimezoneLabel } from '@/lib/timezone';

function formatEventDateTime(startTime: string, hostTimezone: string): string {
  const start = dayjs(startTime).tz(hostTimezone);
  const time = start.format('h:mma').toLowerCase();
  const datePart = start.format('dddd, D MMMM YYYY');
  const tzLabel = getTimezoneLabel(hostTimezone, start.toDate());
  return `${time} - ${datePart} (${tzLabel})`;
}

/** Sends the Calendly-style booking confirmation to the invitee's email. */
export async function sendBookingConfirmationEmail(
  confirmation: BookingConfirmation,
  slug: string,
): Promise<void> {
  const { serviceId, templateId, publicKey } = config.emailjs;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('[EmailJS] Missing configuration — skipping booking confirmation email.');
    return;
  }

  await emailjs.send(
    serviceId,
    templateId,
    {
      to_email: confirmation.inviteeEmail,
      to_name: confirmation.inviteeName,
      recipient_name: confirmation.inviteeName,
      event_type: confirmation.eventTitle,
      invitee_name: confirmation.inviteeName,
      invitee_email: confirmation.inviteeEmail,
      event_date_time: formatEventDateTime(confirmation.startTime, confirmation.hostTimezone),
      invitee_timezone: getTimezoneLabel(confirmation.inviteeTimezone),
      view_event_url: `${window.location.origin}/book/${slug}/success`,
    },
    { publicKey },
  );
}
