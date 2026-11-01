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

export type MeetingCancelledData = {
  hostName: string;
  hostEmail: string;
  hostTimezone: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeTimezone: string;
  eventTitle: string;
  startTime: Date;
  reason: string | null;
  bookingPageUrl: string;
  meetingsUrl: string;
};

/** Sent to the invitee when the host cancels. Times are in the invitee's zone. */
export function buildInviteeCancellationEmail(data: MeetingCancelledData): EmailContent {
  const when = formatEventDateTime(data.startTime, data.inviteeTimezone);
  const subject = `Canceled: ${data.eventTitle} with ${data.hostName}`;
  const reasonLine = data.reason ? [`Reason: ${data.reason}`] : [];

  const text = [
    `Hi ${data.inviteeName},`,
    '',
    `${data.hostName} canceled your ${data.eventTitle}.`,
    '',
    `Event: ${data.eventTitle}`,
    `When: ${when}`,
    ...reasonLine,
    '',
    `Pick a new time: ${data.bookingPageUrl}`,
  ].join('\n');

  const html = renderEmail(
    subject,
    [
      paragraph(`Hi ${data.inviteeName},`),
      paragraph(`${data.hostName} canceled your ${data.eventTitle}.`, 24),
      field('Event', data.eventTitle),
      field('When', when),
      ...(data.reason ? [field('Reason', data.reason)] : []),
      button('Pick a new time', data.bookingPageUrl),
      footnote(`Questions? Reply to this email to reach ${data.hostName}.`),
    ].join('\n'),
  );

  return { subject, text, html };
}

/** Copy for the host, confirming the cancellation. Times are in the host's zone. */
export function buildHostCancellationEmail(data: MeetingCancelledData): EmailContent {
  const when = formatEventDateTime(data.startTime, data.hostTimezone);
  const subject = `Canceled: ${data.eventTitle} - ${data.inviteeName}`;
  const reasonLine = data.reason ? [`Reason: ${data.reason}`] : [];

  const text = [
    `Hi ${data.hostName},`,
    '',
    'The event below has been canceled and the invitee has been notified.',
    '',
    `Event Type: ${data.eventTitle}`,
    `Invitee: ${data.inviteeName}`,
    `Invitee Email: ${data.inviteeEmail}`,
    `Event Date/Time: ${when}`,
    ...reasonLine,
    '',
    `View your meetings: ${data.meetingsUrl}`,
  ].join('\n');

  const html = renderEmail(
    subject,
    [
      paragraph(`Hi ${data.hostName},`),
      paragraph('The event below has been canceled and the invitee has been notified.', 24),
      field('Event Type', data.eventTitle),
      field('Invitee', data.inviteeName),
      field('Invitee Email', data.inviteeEmail, true),
      field('Event Date/Time', when),
      ...(data.reason ? [field('Reason', data.reason)] : []),
      link('View your meetings', data.meetingsUrl),
    ].join('\n'),
  );

  return { subject, text, html };
}
