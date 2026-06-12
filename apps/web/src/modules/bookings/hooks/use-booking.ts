import { useMutation, useQuery } from '@tanstack/react-query';
import type { CreateBookingDto } from '@calendly/shared';
import { queryKeys } from '@/lib/query-keys';
import { bookingService } from '../services/booking.service';

export function usePublicEventType(slug: string) {
  return useQuery({
    queryKey: queryKeys.booking.eventType(slug),
    queryFn: () => bookingService.getEventType(slug),
  });
}

export function useBookingSlots(slug: string, date: string, timezone: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.booking.slots(slug, date, timezone),
    queryFn: () => bookingService.getSlots(slug, date, timezone),
    enabled: enabled && Boolean(date),
  });
}

export function useCreateBooking(slug: string) {
  return useMutation({
    mutationFn: (payload: CreateBookingDto) => bookingService.create(slug, payload),
  });
}
