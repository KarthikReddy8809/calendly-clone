import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CancelMeetingDto, ListMeetingsQuery } from '@calendly/shared';
import { queryKeys } from '@/lib/query-keys';
import { toast } from '@/components/ui/sonner';
import { ApiRequestError } from '@/lib/api-client';
import { meetingService } from '../services/meeting.service';

export function useMeetings(query: ListMeetingsQuery) {
  return useQuery({
    queryKey: queryKeys.meetings.list(query),
    queryFn: () => meetingService.list(query),
  });
}

export function useCancelMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelMeetingDto }) =>
      meetingService.cancel(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
      toast.success('Meeting cancelled');
    },
    onError: (error) => {
      toast.error(error instanceof ApiRequestError ? error.message : 'Failed to cancel meeting');
    },
  });
}
