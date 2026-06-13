/** Long timezone label, e.g. "India Standard Time". */
export function getTimezoneLabel(timezone: string, date = new Date()): string {
  return (
    new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'long' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? timezone
  );
}
