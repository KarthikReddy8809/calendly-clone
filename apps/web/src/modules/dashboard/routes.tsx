import { createRoute } from '@tanstack/react-router';
import { appLayoutRoute } from '@/app/router/routes-core';
import { EventTypesPage } from '@/modules/event-types/pages/event-types-page';

/** The Scheduling (event types) page is the app's home route. */
export const schedulingRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: EventTypesPage,
});
