import { createRoute } from '@tanstack/react-router';
import { appLayoutRoute } from '@/app/router/routes-core';
import { AvailabilityPage } from './pages/availability-page';

export const availabilityRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/availability',
  component: AvailabilityPage,
});
