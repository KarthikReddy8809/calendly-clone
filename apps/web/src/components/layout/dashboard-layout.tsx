import { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { PageLoader } from '@/components/common/loaders';
import { EventTypeDrawer } from '@/modules/event-types/components/event-type-drawer';

/**
 * Authenticated app shell: persistent white sidebar + header. The event editor
 * drawer is mounted once here so any "Create" button can open it globally.
 */
export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="w-full flex-1 px-4 py-6 md:px-8 bg-muted">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <EventTypeDrawer />
    </div>
  );
}
