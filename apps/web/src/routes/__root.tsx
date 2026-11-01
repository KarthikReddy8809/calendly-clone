import { createRootRoute, Outlet } from '@tanstack/react-router';

/** Root route renders a bare Outlet; layouts are nested below. */
export const Route = createRootRoute({
  component: () => <Outlet />,
});
