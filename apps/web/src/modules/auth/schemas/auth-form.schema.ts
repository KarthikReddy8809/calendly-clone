import { z } from 'zod';
import { loginSchema, signupSchema } from '@calendly/shared';

export const loginFormSchema = loginSchema;
export type LoginFormValues = z.infer<typeof loginFormSchema>;

/** The browser supplies the timezone on submit, so the form does not ask for it. */
export const signupFormSchema = signupSchema.omit({ timezone: true });
export type SignupFormValues = z.infer<typeof signupFormSchema>;

/**
 * Where to go after login. Only same-app paths are allowed, so a crafted
 * `?redirect=https://evil.example` link cannot bounce a host off-site.
 */
export const authSearchSchema = z.object({
  redirect: z
    .string()
    .refine((value) => value.startsWith('/') && !value.startsWith('//'))
    .optional()
    .catch(undefined),
});
