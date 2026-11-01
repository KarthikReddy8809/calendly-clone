import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { getTimezoneLabel } from './timezone-label.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export type EmailContent = { subject: string; text: string; html: string };

/**
 * Escapes text for HTML. Invitee names, notes and cancellation reasons are
 * typed by strangers on a public page, so every interpolated value goes
 * through this before it reaches an email body.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** "9:30am - Monday, 3 November 2026 (India Standard Time)" in the given zone. */
export function formatEventDateTime(start: Date, ianaTimezone: string): string {
  const startLocal = dayjs(start).tz(ianaTimezone);
  const time = startLocal.format('h:mma').toLowerCase();
  const date = startLocal.format('dddd, D MMMM YYYY');
  const tzLabel = getTimezoneLabel(ianaTimezone, start);
  return `${time} - ${date} (${tzLabel})`;
}

const CALENDLY_LOGO_HTML = `
<div style="width:40px;height:40px;border-radius:50%;background-color:#006BFF;display:inline-block;line-height:40px;text-align:center;color:#FFFFFF;font-size:22px;font-weight:700;font-family:Helvetica,Arial,sans-serif;">
  C
</div>`.trim();

/** A bold label over a value. `value` is escaped here; pass raw text. */
export function field(label: string, value: string, valueIsEmail = false): string {
  const safe = escapeHtml(value);
  const valueHtml = valueIsEmail
    ? `<a href="mailto:${safe}" style="color:#006BFF;text-decoration:none;">${safe}</a>`
    : safe;

  return `
    <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;color:#1a1a1a;">
      <strong style="font-weight:700;">${escapeHtml(label)}</strong><br>
      ${valueHtml}
    </p>`.trim();
}

/** A paragraph of plain text. `text` is escaped here; pass raw text. */
export function paragraph(text: string, marginBottom = 16): string {
  return `<p style="margin:0 0 ${marginBottom}px 0;font-size:16px;line-height:24px;">${escapeHtml(text)}</p>`;
}

/** A filled call-to-action button. `href` must be a URL we built, never user input. */
export function button(label: string, href: string): string {
  return `
    <p style="margin:8px 0 32px 0;">
      <a href="${escapeHtml(href)}" style="display:inline-block;background-color:#006BFF;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 24px;border-radius:999px;">${escapeHtml(label)}</a>
    </p>`.trim();
}

/** A plain underlined link. `href` must be a URL we built, never user input. */
export function link(label: string, href: string): string {
  return `
    <p style="margin:0 0 32px 0;font-size:16px;line-height:24px;">
      <a href="${escapeHtml(href)}" style="color:#006BFF;text-decoration:underline;">${escapeHtml(label)}</a>
    </p>`.trim();
}

/** Grey footnote under a divider. */
export function footnote(text: string): string {
  return `
    <hr style="border:none;border-top:1px solid #e6e6e6;margin:0 0 24px 0;">
    <p style="margin:0;font-size:14px;line-height:22px;color:#666666;">${escapeHtml(text)}</p>`.trim();
}

/** Wraps already-built body HTML in the shared email chrome. */
export function renderEmail(subject: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
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
              ${bodyHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
