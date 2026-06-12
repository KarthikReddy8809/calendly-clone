import { ENDPOINTS } from '@calendly/shared';
import type { CancelMeetingDto, ListMeetingsQuery, Meeting } from '@calendly/shared';
import { api } from '@/lib/api-client';

export const meetingService = {
  list: (query: ListMeetingsQuery) =>
    api.get<Meeting[]>(ENDPOINTS.meetings.list, query as Record<string, unknown>),
  cancel: (id: string, payload: CancelMeetingDto) =>
    api.put<Meeting>(ENDPOINTS.meetings.cancel(id), payload),
};
