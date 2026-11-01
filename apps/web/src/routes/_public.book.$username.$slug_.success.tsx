import { createFileRoute } from '@tanstack/react-router';
import { BookingSuccessPage } from '@/modules/bookings/pages/booking-success-page';

export const Route = createFileRoute('/_public/book/$username/$slug_/success')({
  component: BookingSuccessPage,
});
