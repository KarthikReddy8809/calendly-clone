export const WEEKDAYS = [
  { value: 0, short: 'SUN', label: 'Sunday' },
  { value: 1, short: 'MON', label: 'Monday' },
  { value: 2, short: 'TUE', label: 'Tuesday' },
  { value: 3, short: 'WED', label: 'Wednesday' },
  { value: 4, short: 'THU', label: 'Thursday' },
  { value: 5, short: 'FRI', label: 'Friday' },
  { value: 6, short: 'SAT', label: 'Saturday' },
] as const;

export type WeekdayValue = (typeof WEEKDAYS)[number]['value'];

/** Supported meeting durations (minutes) surfaced in the event type editor. */
export const EVENT_DURATIONS = [15, 30, 45, 60, 90, 120] as const;
export type EventDuration = (typeof EVENT_DURATIONS)[number];

/** Brand palette presets shown when creating an event type (Calendly-like). */
export const EVENT_COLORS = [
  '#0069ff',
  '#8247f5',
  '#00a991',
  '#e25755',
  '#f5a623',
  '#e0539b',
] as const;

/** A curated subset of IANA timezones for the timezone picker. */
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

export const DEFAULT_TIMEZONE = 'UTC';
export const DEFAULT_PAGE_SIZE = 20;
