import { createRoute } from '@tanstack/react-router';
import { publicLayoutRoute } from '@/app/router/routes-core';
import { BookingPage } from './pages/booking-page';
import { BookingSuccessPage } from './pages/booking-success-page';

export const bookingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/book/$slug',
  component: BookingPage,
});

export const bookingSuccessRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/book/$slug/success',
  component: BookingSuccessPage,
});
