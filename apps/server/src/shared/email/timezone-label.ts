/** Human-readable timezone label, e.g. "India Standard Time". */
export function getTimezoneLabel(ianaTimezone: string, date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    timeZoneName: 'long',
  });
  const part = formatter.formatToParts(date).find((p) => p.type === 'timeZoneName');
  return part?.value ?? ianaTimezone;
}
