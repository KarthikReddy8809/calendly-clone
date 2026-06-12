import { z } from 'zod';

/** 24h time-of-day string, e.g. "09:00" or "17:30". */
export const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be a HH:mm time string');

/** URL-safe slug used for public booking pages. */
export const slugSchema = z
  .string()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase, hyphen-separated slug');

/** IANA timezone identifier. Validated against the runtime Intl database. */
export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid IANA timezone' },
);

export const cuidSchema = z.string().min(1);
export const isoDateTimeSchema = z.string().datetime({ offset: true });
