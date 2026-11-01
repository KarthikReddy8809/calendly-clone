import { ENDPOINTS } from '@calendly/shared';
import type {
  BookingConfirmation,
  BookingSlotsResponse,
  CreateBookingDto,
  PublicEventType,
} from '@calendly/shared';
import { api } from '@/lib/api-client';

export const bookingService = {
  getEventType: (username: string, slug: string) =>
    api.get<PublicEventType>(ENDPOINTS.booking.getEventType(username, slug)),
  getSlots: (username: string, slug: string, date: string, timezone: string) =>
    api.get<BookingSlotsResponse>(ENDPOINTS.booking.getSlots(username, slug), {
      date,
      timezone,
    }),
  create: (username: string, slug: string, payload: CreateBookingDto) =>
    api.post<BookingConfirmation>(ENDPOINTS.booking.create(username, slug), payload),
};
