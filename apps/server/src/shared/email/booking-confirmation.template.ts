import {
  button,
  field,
  footnote,
  formatEventDateTime,
  link,
  paragraph,
  renderEmail,
  type EmailContent,
} from './email-layout.js';

/** Sent to the invitee right after they book. Times are in their timezone. */
export type BookingConfirmationData = {
  inviteeName: string;
  inviteeEmail: string;
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  durationMinutes: number;
  location: string;
  /** Unique Google Meet link for this meeting, when one was created. */
  meetUrl: string | null;
  startTime: Date;
  inviteeTimezone: string;
  bookingPageUrl: string;
};

export function buildBookingConfirmationEmail(data: BookingConfirmationData): EmailContent {
  const when = formatEventDateTime(data.startTime, data.inviteeTimezone);
  const subject = `Confirmed: ${data.eventTitle} with ${data.hostName}`;
  const footer = `Need to make changes? Reply to this email to reach ${data.hostName}.`;

  const text = [
    `Hi ${data.inviteeName},`,
    '',
    `Your ${data.eventTitle} with ${data.hostName} is scheduled.`,
    '',
    `Event: ${data.eventTitle} (${data.durationMinutes} min)`,
    `With: ${data.hostName} (${data.hostEmail})`,
    `When: ${when}`,
    `Where: ${data.location}`,
    ...(data.meetUrl ? [`Join Google Meet: ${data.meetUrl}`] : []),
    '',
    `Book another time: ${data.bookingPageUrl}`,
    '',
    footer,
  ].join('\n');

  const html = renderEmail(
    subject,
    [
      paragraph(`Hi ${data.inviteeName},`),
      paragraph(`Your ${data.eventTitle} with ${data.hostName} is scheduled.`, 24),
      field('Event', `${data.eventTitle} (${data.durationMinutes} min)`),
      field('With', data.hostName),
      field('Host Email', data.hostEmail, true),
      field('When', when),
      field('Where', data.location),
      ...(data.meetUrl
        ? [field('Google Meet', data.meetUrl), button('Join Google Meet', data.meetUrl)]
        : []),
      data.meetUrl
        ? link('Book another time', data.bookingPageUrl)
        : button('Book another time', data.bookingPageUrl),
      footnote(footer),
    ].join('\n'),
  );

  return { subject, text, html };
}
