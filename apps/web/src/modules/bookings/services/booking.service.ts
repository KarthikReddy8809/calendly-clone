import { ENDPOINTS } from '@calendly/shared';
import type {
  BookingConfirmation,
  BookingSlotsResponse,
  CreateBookingDto,
  PublicEventType,
} from '@calendly/shared';
import { api } from '@/lib/api-client';

export const bookingService = {
  getEventType: (slug: string) =>
    api.get<PublicEventType>(ENDPOINTS.booking.getEventType(slug)),
  getSlots: (slug: string, date: string, timezone: string) =>
    api.get<BookingSlotsResponse>(ENDPOINTS.booking.getSlots(slug), { date, timezone }),
  create: (slug: string, payload: CreateBookingDto) =>
    api.post<BookingConfirmation>(ENDPOINTS.booking.create(slug), payload),
};
