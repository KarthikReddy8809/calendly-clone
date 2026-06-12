import { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import { ChevronDown, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { PageLoader } from '@/components/common/loaders';

/** Minimal, distraction-free shell for public booking pages. */
export function PublicLayout() {
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <header className="flex items-center justify-end gap-2 bg-white px-6 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="font-medium text-foreground">
              Menu <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyLink}>Copy link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="rounded-full font-medium"
        >
          <Link2 className="h-4 w-4" /> Copy link
        </Button>
      </header>

      <main className="px-4 py-10">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
