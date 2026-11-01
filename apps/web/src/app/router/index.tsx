import { createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import { NotFoundPage } from '@/components/common/not-found';
import { PageLoader } from '@/components/common/loaders';
import { onUnauthorized } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: PageLoader,
  defaultNotFoundComponent: NotFoundPage,
});

// Session expired or was revoked mid-use: forget the user and send them to
// log in, coming back to the page they were on.
onUnauthorized(() => {
  queryClient.setQueryData(queryKeys.auth.me, null);
  const { pathname, href } = router.state.location;
  if (pathname !== '/login' && pathname !== '/signup') {
    void router.navigate({ to: '/login', search: { redirect: href } });
  }
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
