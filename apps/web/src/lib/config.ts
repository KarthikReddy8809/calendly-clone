import { API_PREFIX } from '@calendly/shared';

/**
 * Runtime config. In dev, Vite proxies `/api` to the Express server, so the
 * default base URL is just the API prefix. Override with VITE_API_BASE_URL for
 * deployments where the API lives on a different origin.
 */
const apiBaseUrlFromEnv = import.meta.env.VITE_API_BASE_URL?.trim();

export const config = {
  apiBaseUrl: apiBaseUrlFromEnv || API_PREFIX,
  appName: 'Calendly Clone',
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() ?? '',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() ?? '',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() ?? '',
  },
} as const;
