import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateAvailabilityDto } from '@calendly/shared';
import { queryKeys } from '@/lib/query-keys';
import { toast } from '@/components/ui/sonner';
import { ApiRequestError } from '@/lib/api-client';
import { availabilityService } from '../services/availability.service';

export function useAvailability() {
  return useQuery({
    queryKey: queryKeys.availability.all,
    queryFn: availabilityService.get,
  });
}

export function useUpdateAvailability(options?: { silent?: boolean }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAvailabilityDto) => availabilityService.update(payload),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.availability.all, data);
      if (!options?.silent) toast.success('Availability saved');
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : 'Failed to save availability');
    },
  });
}
