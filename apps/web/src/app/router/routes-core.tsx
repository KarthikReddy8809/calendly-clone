import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PublicLayout } from '@/components/layout/public-layout';

/** Root route renders a bare Outlet; layouts are nested below. */
export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

/**
 * Pathless layout route for the authenticated dashboard. Feature modules attach
 * their pages as children of this route via `getParentRoute`.
 */
export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'dashboard',
  component: DashboardLayout,
});

/** Pathless layout route for public booking pages. */
export const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: PublicLayout,
});
