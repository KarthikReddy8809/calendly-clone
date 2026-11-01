import { getTimezoneLabel } from './timezone-label.js';
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

/** Sent to the host when an invitee books one of their event types. */
export type BookingNotificationData = {
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeNotes: string | null;
  startTime: Date;
  endTime: Date;
  hostTimezone: string;
  inviteeTimezone: string;
  /** Unique Google Meet link for this meeting, when one was created. */
  meetUrl: string | null;
  meetingsUrl: string;
};

const PRO_TIP =
  'Pro Tip! Connect your video conferencing accounts to automatically add unique conferencing details to your Calendly events.';

export function buildBookingNotificationEmail(data: BookingNotificationData): EmailContent {
  const eventDateTime = formatEventDateTime(data.startTime, data.hostTimezone);
  const inviteeTzLabel = getTimezoneLabel(data.inviteeTimezone, data.startTime);
  const subject = `New Event: ${data.eventTitle} - ${data.inviteeName}`;

  const text = [
    `Hi ${data.hostName},`,
    '',
    'A new event has been scheduled.',
    '',
    `Event Type: ${data.eventTitle}`,
    `Invitee: ${data.inviteeName}`,
    `Invitee Email: ${data.inviteeEmail}`,
    `Event Date/Time: ${eventDateTime}`,
    `Invitee Time Zone: ${inviteeTzLabel}`,
    ...(data.inviteeNotes ? [`Notes from invitee: ${data.inviteeNotes}`] : []),
    ...(data.meetUrl ? [`Google Meet: ${data.meetUrl}`] : []),
    '',
    `View event in Calendly: ${data.meetingsUrl}`,
    ...(data.meetUrl ? [] : ['', PRO_TIP]),
  ].join('\n');

  const html = renderEmail(
    subject,
    [
      paragraph(`Hi ${data.hostName},`),
      paragraph('A new event has been scheduled.', 24),
      field('Event Type', data.eventTitle),
      field('Invitee', data.inviteeName),
      field('Invitee Email', data.inviteeEmail, true),
      field('Event Date/Time', eventDateTime),
      field('Invitee Time Zone', inviteeTzLabel),
      ...(data.inviteeNotes ? [field('Notes from invitee', data.inviteeNotes)] : []),
      ...(data.meetUrl
        ? [field('Google Meet', data.meetUrl), button('Join Google Meet', data.meetUrl)]
        : []),
      link('View event in Calendly', data.meetingsUrl),
      // The tip suggests connecting video conferencing: moot once a link exists.
      data.meetUrl ? '' : footnote(PRO_TIP),
    ].join('\n'),
  );

  return { subject, text, html };
}
