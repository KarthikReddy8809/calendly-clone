import { z } from 'zod';
import { isoDateTimeSchema, timezoneSchema } from '../../common/primitives.js';
import { publicHostSchema } from '../user/user.schema.js';

/** Public view of an event type plus its host, rendered on /book/:slug. */
export const publicEventTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  durationMinutes: z.number().int(),
  color: z.string(),
  locationType: z.string(),
  host: publicHostSchema,
});

export type PublicEventType = z.infer<typeof publicEventTypeSchema>;

/** A bookable slot returned for a given day. */
export const bookingSlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

export type BookingSlot = z.infer<typeof bookingSlotSchema>;

export const bookingSlotsResponseSchema = z.object({
  date: z.string(),
  timezone: z.string(),
  slots: z.array(bookingSlotSchema),
});

export type BookingSlotsResponse = z.infer<typeof bookingSlotsResponseSchema>;

/* ------------------------------- DTOs ------------------------------- */

export const getSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  timezone: timezoneSchema,
});

export type GetSlotsQuery = z.input<typeof getSlotsQuerySchema>;

export const createBookingSchema = z.object({
  startTime: isoDateTimeSchema,
  inviteeName: z.string().min(1, 'Name is required').max(120),
  inviteeEmail: z.string().email('Enter a valid email'),
  inviteeNotes: z.string().max(1000).optional().nullable(),
  inviteeTimezone: timezoneSchema,
});

export type CreateBookingDto = z.input<typeof createBookingSchema>;

/** Confirmation payload returned after a successful booking. */
export const bookingConfirmationSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  inviteeName: z.string(),
  inviteeEmail: z.string().email(),
  inviteeTimezone: z.string(),
  eventTitle: z.string(),
  hostName: z.string(),
  locationType: z.string(),
});

export type BookingConfirmation = z.infer<typeof bookingConfirmationSchema>;
