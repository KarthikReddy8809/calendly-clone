import { ENDPOINTS } from '@calendly/shared';
import type { CreateEventTypeDto, EventType, UpdateEventTypeDto } from '@calendly/shared';
import { api } from '@/lib/api-client';

/** Typed API surface for the event-types module. */
export const eventTypeService = {
  list: () => api.get<EventType[]>(ENDPOINTS.events.list),
  create: (payload: CreateEventTypeDto) => api.post<EventType>(ENDPOINTS.events.create, payload),
  update: (id: string, payload: UpdateEventTypeDto) =>
    api.put<EventType>(ENDPOINTS.events.update(id), payload),
  remove: (id: string) => api.delete<{ id: string }>(ENDPOINTS.events.remove(id)),
};
