import { createRoute } from '@tanstack/react-router';
import { appLayoutRoute } from '@/app/router/routes-core';
import { MeetingsPage } from './pages/meetings-page';

export const meetingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/meetings',
  component: MeetingsPage,
});
