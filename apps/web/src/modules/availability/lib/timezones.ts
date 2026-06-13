/** Curated, Calendly-style timezone list. Each entry maps a friendly label to
 *  an IANA identifier (what the backend persists and validates against). */
export interface TimezoneOption {
  value: string;
  label: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'America/Los_Angeles', label: 'Pacific Time - US & Canada' },
  { value: 'America/Denver', label: 'Mountain Time - US & Canada' },
  { value: 'America/Chicago', label: 'Central Time - US & Canada' },
  { value: 'America/New_York', label: 'Eastern Time - US & Canada' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'America/Phoenix', label: 'Arizona, Yukon Time' },
  { value: 'America/St_Johns', label: 'Newfoundland Time' },
  { value: 'America/Sao_Paulo', label: 'Brasilia Time' },
  { value: 'Europe/London', label: 'London, Dublin, Edinburgh' },
  { value: 'Europe/Paris', label: 'Paris, Madrid, Berlin, Rome' },
  { value: 'Europe/Athens', label: 'Athens, Bucharest, Istanbul' },
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Asia/Singapore', label: 'Singapore, Kuala Lumpur' },
  { value: 'Asia/Tokyo', label: 'Japan, Korea Time' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne' },
  { value: 'UTC', label: 'UTC' },
];

const LABEL_BY_VALUE = new Map(TIMEZONE_OPTIONS.map((tz) => [tz.value, tz.label]));

/** Friendly label for a stored IANA value, falling back to the raw id. */
export function timezoneLabel(value: string): string {
  return LABEL_BY_VALUE.get(value) ?? value;
}
