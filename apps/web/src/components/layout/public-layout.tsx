import { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import { CalendarClock } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { PageLoader } from '@/components/common/loaders';

/** Minimal, distraction-free shell for public booking pages. */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <CalendarClock className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-foreground">Calendly</span>
      </div>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
