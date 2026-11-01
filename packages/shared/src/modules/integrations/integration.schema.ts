import { z } from 'zod';

/** What the Integrations page needs to know about Google Calendar. */
export const googleIntegrationStatusSchema = z.object({
  /** False when the server has no Google OAuth credentials: connecting is impossible. */
  configured: z.boolean(),
  connected: z.boolean(),
  /** The connected Google account, for display. */
  email: z.string().nullable(),
});

export type GoogleIntegrationStatus = z.infer<typeof googleIntegrationStatusSchema>;

export const googleConnectResponseSchema = z.object({ url: z.string().url() });
export type GoogleConnectResponse = z.infer<typeof googleConnectResponseSchema>;

/** `?google=` values the API's OAuth callback redirects back to the web app with. */
export const GOOGLE_CONNECT_RESULTS = [
  'connected',
  'denied',
  'missing_scope',
  'session_mismatch',
  'error',
] as const;
export type GoogleConnectResult = (typeof GOOGLE_CONNECT_RESULTS)[number];
