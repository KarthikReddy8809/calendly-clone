import {
  button,
  field,
  footnote,
  paragraph,
  renderEmail,
  type EmailContent,
} from './email-layout.js';

/** Sent once after a host signs up. */
export type WelcomeEmailData = {
  hostName: string;
  hostEmail: string;
  dashboardUrl: string;
  publicPageUrl: string;
};

export function buildWelcomeEmail(data: WelcomeEmailData): EmailContent {
  const subject = 'Welcome to Calendly';
  const tip =
    'Your availability starts as Monday to Friday, 9:00 to 17:00. Change it any time under Availability.';

  const text = [
    `Hi ${data.hostName},`,
    '',
    'Your account is ready. Create an event type, then share its link so people can book time with you.',
    '',
    `Your booking links start with: ${data.publicPageUrl}`,
    `Go to your dashboard: ${data.dashboardUrl}`,
    '',
    tip,
  ].join('\n');

  const html = renderEmail(
    subject,
    [
      paragraph(`Hi ${data.hostName},`),
      paragraph(
        'Your account is ready. Create an event type, then share its link so people can book time with you.',
        24,
      ),
      field('Your booking links start with', data.publicPageUrl),
      button('Go to your dashboard', data.dashboardUrl),
      footnote(tip),
    ].join('\n'),
  );

  return { subject, text, html };
}
