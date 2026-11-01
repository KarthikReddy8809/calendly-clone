import {
  button,
  escapeHtml,
  field,
  footnote,
  paragraph,
  renderEmail,
  type EmailContent,
} from './email-layout.js';

/** Sent by a host to invite someone to book one of their event types. */
export type InvitationEmailData = {
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  durationMinutes: number;
  message: string | null;
  bookingUrl: string;
};

export function buildInvitationEmail(data: InvitationEmailData): EmailContent {
  const subject = `${data.hostName} invited you to book: ${data.eventTitle}`;
  const intro = `${data.hostName} would like to meet with you. Pick a time that works for you.`;
  const footer = `Questions? Reply to this email to reach ${data.hostName}.`;

  const text = [
    'Hi,',
    '',
    intro,
    ...(data.message ? ['', data.message] : []),
    '',
    `Event: ${data.eventTitle} (${data.durationMinutes} min)`,
    `Pick a time: ${data.bookingUrl}`,
    '',
    footer,
  ].join('\n');

  // The host's note is free text: escape it, then keep their line breaks.
  const messageHtml = data.message
    ? `<p style="margin:0 0 24px 0;padding:12px 16px;border-left:3px solid #006BFF;background-color:#f5f8ff;font-size:16px;line-height:24px;">${escapeHtml(data.message).replace(/\r?\n/g, '<br>')}</p>`
    : '';

  const html = renderEmail(
    subject,
    [
      paragraph('Hi,'),
      paragraph(intro, 24),
      messageHtml,
      field('Event', `${data.eventTitle} (${data.durationMinutes} min)`),
      field('From', data.hostName),
      button('Pick a time', data.bookingUrl),
      footnote(footer),
    ].join('\n'),
  );

  return { subject, text, html };
}
