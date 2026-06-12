import { createRouter } from '@tanstack/react-router';
import { appLayoutRoute, publicLayoutRoute, rootRoute } from './routes-core';
import { schedulingRoute } from '@/modules/dashboard/routes';
import { availabilityRoute } from '@/modules/availability/routes';
import { meetingsRoute } from '@/modules/meetings/routes';
import { bookingRoute, bookingSuccessRoute } from '@/modules/bookings/routes';
import { NotFoundPage } from '@/components/common/not-found';
import { PageLoader } from '@/components/common/loaders';

/** Compose the full route tree from each feature module's route definitions. */
const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([schedulingRoute, availabilityRoute, meetingsRoute]),
  publicLayoutRoute.addChildren([bookingRoute, bookingSuccessRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: PageLoader,
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
