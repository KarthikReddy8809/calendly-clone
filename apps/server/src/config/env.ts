import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

/**
 * Environment schema. Validation runs once at startup so the process fails
 * fast with a readable error instead of crashing deep inside a request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().min(1).optional(),
  WEB_APP_URL: z.string().url().optional(),
  // Signs host session cookies. Required in production; development falls
  // back to a fixed local-only secret so `pnpm dev` works without setup.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  // Google Calendar + Meet. All three together, or none (the feature turns off).
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', details);
  const message = `Invalid environment configuration: ${JSON.stringify(details)}`;
  if (process.env.VERCEL) {
    throw new Error(message);
  }
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && !parsed.data.JWT_SECRET) {
  const message = 'Invalid environment configuration: JWT_SECRET is required in production';
  // eslint-disable-next-line no-console
  console.error(message);
  if (process.env.VERCEL) {
    throw new Error(message);
  }
  process.exit(1);
}

const googleVars = [
  parsed.data.GOOGLE_CLIENT_ID,
  parsed.data.GOOGLE_CLIENT_SECRET,
  parsed.data.GOOGLE_REDIRECT_URI,
];
if (googleVars.some(Boolean) && !googleVars.every(Boolean)) {
  const message =
    'Invalid environment configuration: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI together';
  // eslint-disable-next-line no-console
  console.error(message);
  if (process.env.VERCEL) {
    throw new Error(message);
  }
  process.exit(1);
}

export const env = parsed.data;
export const jwtSecret = env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me-0000000';
export const webAppUrl = env.WEB_APP_URL ?? env.CORS_ORIGINS[0] ?? 'http://localhost:5173';
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
