import {
  ENDPOINTS,
  type GoogleConnectResponse,
  type GoogleIntegrationStatus,
} from '@calendly/shared';
import { api } from '@/lib/api-client';

export const integrationService = {
  googleStatus: () => api.get<GoogleIntegrationStatus>(ENDPOINTS.integrations.google),
  googleConnect: () => api.post<GoogleConnectResponse>(ENDPOINTS.integrations.googleConnect),
  googleDisconnect: () => api.delete<{ disconnected: boolean }>(ENDPOINTS.integrations.google),
};
