import { z } from 'zod';
import { EVENT_COLORS, EVENT_DURATIONS, LOCATION_TYPES } from '@calendly/shared';

/**
 * Form schema for the event-type editor. Mirrors the shared create schema but
 * is tailored for react-hook-form (non-nullable strings for inputs).
 */
export const eventTypeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  slug: z
    .string()
    .min(3, 'At least 3 characters')
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  durationMinutes: z.coerce
    .number()
    .refine((v) => (EVENT_DURATIONS as readonly number[]).includes(v), 'Unsupported duration'),
  color: z.enum(EVENT_COLORS),
  locationType: z.enum(LOCATION_TYPES),
  isActive: z.boolean(),
});

export type EventTypeFormValues = z.infer<typeof eventTypeFormSchema>;

export const LOCATION_LABELS: Record<(typeof LOCATION_TYPES)[number], string> = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  phone: 'Phone Call',
  in_person: 'In Person',
  custom: 'Custom',
};
