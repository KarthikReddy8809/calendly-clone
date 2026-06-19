import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { getTimezoneLabel } from './timezone-label.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export type BookingNotificationData = {
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  inviteeName: string;
  inviteeEmail: string;
  startTime: Date;
  endTime: Date;
  hostTimezone: string;
  inviteeTimezone: string;
  meetingsUrl: string;
};

function formatEventDateTime(start: Date, hostTimezone: string): string {
  const startLocal = dayjs(start).tz(hostTimezone);
  const time = startLocal.format('h:mma').toLowerCase();
  const date = startLocal.format('dddd, D MMMM YYYY');
  const tzLabel = getTimezoneLabel(hostTimezone, start);
  return `${time} - ${date} (${tzLabel})`;
}

const CALENDLY_LOGO_HTML = `
<div style="width:40px;height:40px;border-radius:50%;background-color:#006BFF;display:inline-block;line-height:40px;text-align:center;color:#FFFFFF;font-size:22px;font-weight:700;font-family:Helvetica,Arial,sans-serif;">
  C
</div>`.trim();

function field(label: string, value: string, valueIsLink = false): string {
  const valueHtml = valueIsLink
    ? `<a href="mailto:${value}" style="color:#006BFF;text-decoration:none;">${value}</a>`
    : value;

  return `
    <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;color:#1a1a1a;">
      <strong style="font-weight:700;">${label}</strong><br>
      ${valueHtml}
    </p>`.trim();
}

export function buildBookingNotificationEmail(data: BookingNotificationData): {
  subject: string;
  text: string;
  html: string;
} {
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
    '',
    `View event in Calendly: ${data.meetingsUrl}`,
    '',
    'Pro Tip! Connect your video conferencing accounts to automatically add unique conferencing details to your Calendly events.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 16px 24px 16px;">
        ${CALENDLY_LOGO_HTML}
      </td>
    </tr>
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;margin:0 auto;">
          <tr>
            <td style="padding:0 24px 32px 24px;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">Hi ${data.hostName},</p>
              <p style="margin:0 0 24px 0;font-size:16px;line-height:24px;">A new event has been scheduled.</p>

              ${field('Event Type', data.eventTitle)}
              ${field('Invitee', data.inviteeName)}
              ${field('Invitee Email', data.inviteeEmail, true)}
              ${field('Event Date/Time', eventDateTime)}
              ${field('Invitee Time Zone', inviteeTzLabel)}

              <p style="margin:0 0 32px 0;font-size:16px;line-height:24px;">
                <a href="${data.meetingsUrl}" style="color:#006BFF;text-decoration:underline;">View event in Calendly</a>
              </p>

              <hr style="border:none;border-top:1px solid #e6e6e6;margin:0 0 24px 0;">

              <p style="margin:0;font-size:14px;line-height:22px;color:#666666;">
                <strong style="color:#1a1a1a;font-weight:700;">Pro Tip!</strong>
                Connect your video conferencing accounts to automatically add unique conferencing details to your Calendly events.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  return { subject, text, html };
}
