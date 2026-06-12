import type { ListMeetingsQuery } from '@calendly/shared';

/** Centralized, type-safe query key factory to avoid string drift. */
export const queryKeys = {
  eventTypes: {
    all: ['event-types'] as const,
    list: () => [...queryKeys.eventTypes.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.eventTypes.all, 'detail', id] as const,
  },
  availability: {
    all: ['availability'] as const,
  },
  meetings: {
    all: ['meetings'] as const,
    list: (params: ListMeetingsQuery) => [...queryKeys.meetings.all, 'list', params] as const,
  },
  booking: {
    all: ['booking'] as const,
    eventType: (slug: string) => [...queryKeys.booking.all, 'event', slug] as const,
    slots: (slug: string, date: string, timezone: string) =>
      [...queryKeys.booking.all, 'slots', slug, date, timezone] as const,
  },
} as const;
