import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateEventTypeDto, UpdateEventTypeDto } from '@calendly/shared';
import { queryKeys } from '@/lib/query-keys';
import { toast } from '@/components/ui/sonner';
import { ApiRequestError } from '@/lib/api-client';
import { eventTypeService } from '../services/event-type.service';

export function useEventTypes() {
  return useQuery({
    queryKey: queryKeys.eventTypes.list(),
    queryFn: eventTypeService.list,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventTypeDto) => eventTypeService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
      toast.success('Event type created');
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : 'Failed to create event type');
    },
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEventTypeDto }) =>
      eventTypeService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
      toast.success('Event type updated');
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : 'Failed to update event type');
    },
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventTypeService.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
      toast.success('Event type deleted');
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : 'Failed to delete event type');
    },
  });
}
