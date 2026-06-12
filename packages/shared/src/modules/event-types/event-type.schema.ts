import { z } from 'zod';
import { slugSchema } from '../../common/primitives.js';
import { EVENT_COLORS, EVENT_DURATIONS } from '../../common/constants.js';

export const LOCATION_TYPES = ['google_meet', 'zoom', 'phone', 'in_person', 'custom'] as const;
export const locationTypeSchema = z.enum(LOCATION_TYPES);
export type LocationType = z.infer<typeof locationTypeSchema>;

/** Canonical event-type entity returned by the API. */
export const eventTypeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  durationMinutes: z.number().int().positive(),
  color: z.string(),
  locationType: locationTypeSchema,
  locationValue: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EventType = z.infer<typeof eventTypeSchema>;

/* ------------------------------- DTOs ------------------------------- */

export const createEventTypeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  slug: slugSchema,
  description: z.string().max(1000).optional().nullable(),
  durationMinutes: z
    .number()
    .int()
    .refine((v) => (EVENT_DURATIONS as readonly number[]).includes(v), {
      message: 'Unsupported duration',
    }),
  color: z
    .string()
    .refine((v) => (EVENT_COLORS as readonly string[]).includes(v), {
      message: 'Unsupported color',
    })
    .default(EVENT_COLORS[0]),
  locationType: locationTypeSchema.default('google_meet'),
  locationValue: z.string().max(255).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateEventTypeDto = z.input<typeof createEventTypeSchema>;

export const updateEventTypeSchema = createEventTypeSchema.partial();
export type UpdateEventTypeDto = z.input<typeof updateEventTypeSchema>;

export type EventTypeResponse = EventType;
export type EventTypeListResponse = EventType[];
