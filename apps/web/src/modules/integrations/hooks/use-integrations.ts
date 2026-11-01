import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { integrationService } from '../services/integration.service';

export function useGoogleIntegration() {
  return useQuery({
    queryKey: queryKeys.integrations.google,
    queryFn: integrationService.googleStatus,
  });
}

/** Asks the API for Google's consent URL and sends the browser there. */
export function useConnectGoogle() {
  return useMutation({
    mutationFn: integrationService.googleConnect,
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
}

export function useDisconnectGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: integrationService.googleDisconnect,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.integrations.google });
    },
  });
}
