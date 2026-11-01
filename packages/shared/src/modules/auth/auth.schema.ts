import { z } from 'zod';
import { timezoneSchema } from '../../common/primitives.js';

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email').max(255);

export const signupSchema = z.object({
  firstname: z.string().trim().min(1, 'First name is required').max(120),
  lastname: z.string().trim().min(1, 'Last name is required').max(60),
  email: emailSchema,
  // bcrypt only reads the first 72 bytes, so longer passwords are rejected.
  password: z.string().min(8, 'Use at least 8 characters').max(72, 'Use at most 72 characters'),
  timezone: timezoneSchema,
});

export type SignupDto = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(72),
});

export type LoginDto = z.infer<typeof loginSchema>;
