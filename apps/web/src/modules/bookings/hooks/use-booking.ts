import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBookingDto } from '@calendly/shared';
import { queryKeys } from '@/lib/query-keys';
import { bookingService } from '../services/booking.service';

export function usePublicEventType(username: string, slug: string) {
  return useQuery({
    queryKey: queryKeys.booking.eventType(username, slug),
    queryFn: () => bookingService.getEventType(username, slug),
  });
}

export function useBookingSlots(
  username: string,
  slug: string,
  date: string,
  timezone: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.booking.slots(username, slug, date, timezone),
    queryFn: () => bookingService.getSlots(username, slug, date, timezone),
    enabled: enabled && Boolean(date),
  });
}

export function useCreateBooking(username: string, slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingDto) => bookingService.create(username, slug, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.meetings.all });
      // The booked slot is gone; refetch so a second booking sees fresh times.
      void qc.invalidateQueries({ queryKey: queryKeys.booking.all });
    },
  });
}
