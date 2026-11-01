import { createFileRoute } from '@tanstack/react-router';
import { BookingPage } from '@/modules/bookings/pages/booking-page';

export const Route = createFileRoute('/_public/book/$username/$slug')({
  component: BookingPage,
});
