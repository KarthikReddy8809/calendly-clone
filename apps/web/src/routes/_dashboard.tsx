import { createFileRoute, redirect } from '@tanstack/react-router';
import { queryClient } from '@/lib/query-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { currentUserQueryOptions } from '@/modules/auth/hooks/use-auth';

/**
 * Pathless layout route for the authenticated dashboard. Pages under
 * `src/routes/_dashboard.*` render inside this layout via its `Outlet`.
 * Visitors without a session are sent to /login and brought back after.
 */
export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ location }) => {
    const user = await queryClient.ensureQueryData(currentUserQueryOptions);
    if (!user) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: DashboardLayout,
});
