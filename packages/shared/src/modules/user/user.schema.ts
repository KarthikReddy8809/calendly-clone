import { z } from 'zod';
import { timezoneSchema } from '../../common/primitives.js';

/** The signed-in host as returned by the auth endpoints. */
export const userSchema = z.object({
  id: z.string(),
  firstname: z.string().nullable(),
  lastname: z.string().nullable(),
  /** Display name: "firstname lastname", falling back to the email. */
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  timezone: timezoneSchema,
});

export type User = z.infer<typeof userSchema>;

/** Public-safe host profile rendered on the booking page. */
export const publicHostSchema = userSchema.pick({
  name: true,
  username: true,
  timezone: true,
});

export type PublicHost = z.infer<typeof publicHostSchema>;
