import { API_PREFIX } from '@calendly/shared';

/**
 * Runtime config. In dev, Vite proxies `/api` to the Express server, so the
 * default base URL is just the API prefix. Override with VITE_API_BASE_URL for
 * deployments where the API lives on a different origin.
 */
export const config = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? API_PREFIX,
  appName: 'Calendly Clone',
} as const;
