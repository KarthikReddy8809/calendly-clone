import { z } from 'zod';
import { timezoneSchema } from '../../common/primitives.js';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  timezone: timezoneSchema,
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

/** Public-safe host profile rendered on the booking page. */
export const publicHostSchema = userSchema.pick({
  name: true,
  username: true,
  timezone: true,
  avatarUrl: true,
});

export type PublicHost = z.infer<typeof publicHostSchema>;
