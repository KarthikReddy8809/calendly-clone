import { z } from 'zod';
import { timeOfDaySchema, timezoneSchema } from '../../common/primitives.js';

/** A single weekday time range, e.g. Monday 09:00 - 17:00. */
export const availabilityRuleSchema = z
  .object({
    id: z.string().optional(),
    weekday: z.number().int().min(0).max(6),
    startTime: timeOfDaySchema,
    endTime: timeOfDaySchema,
  })
  .refine((rule) => rule.startTime < rule.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type AvailabilityRule = z.infer<typeof availabilityRuleSchema>;

export const weeklyAvailabilitySchema = z.object({
  timezone: timezoneSchema,
  rules: z.array(availabilityRuleSchema),
});

export type WeeklyAvailability = z.infer<typeof weeklyAvailabilitySchema>;

/* ------------------------------- DTOs ------------------------------- */

export const updateAvailabilitySchema = weeklyAvailabilitySchema;
export type UpdateAvailabilityDto = z.input<typeof updateAvailabilitySchema>;

export type AvailabilityResponse = WeeklyAvailability;
