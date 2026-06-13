/** Helpers for converting between 24h "HH:mm" storage values and the
 *  human-friendly "8:30am" labels Calendly shows in its availability editor. */

/** Format a "HH:mm" 24h value as a compact am/pm label, e.g. "8:30am". */
export function formatTimeLabel(value: string): string {
  const [hStr, mStr] = value.split(':');
  const hours = Number(hStr);
  const period = hours < 12 ? 'am' : 'pm';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${mStr ?? '00'}${period}`;
}

/** Build the list of 15-minute increment time options across a full day. */
export function buildTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    options.push({ value, label: formatTimeLabel(value) });
  }
  return options;
}

export const TIME_OPTIONS = buildTimeOptions();

/** Minutes since midnight for a "HH:mm" value (used for ordering/filtering). */
export function toMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
