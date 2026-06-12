import { Link } from '@tanstack/react-router';
import {  ChevronsLeft, ChevronsRight, Clock3, Plus, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TbLink } from 'react-icons/tb';
import { useUiStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { CreateEventMenu } from '@/modules/event-types/components/create-event-menu';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Scheduling', icon: TbLink as LucideIcon },
  { to: '/meetings', label: 'Meetings', icon: Video },
  { to: '/availability', label: 'Availability', icon:Clock3 },
];

function CalendlyLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#006BFF" />
        <circle cx="16" cy="16" r="8.5" fill="none" stroke="white" strokeWidth="3" />
        <rect x="22" y="9" width="5" height="5" rx="2.5" fill="#006BFF" />
      </svg>
      <h3 className="text-2xl  tracking-tight text-[#006BFF]">Calendly</h3>
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'flex flex-col gap-4 sticky top-0 hidden h-screen p-2 shrink-0 justify-between border-r border-border bg-white px-3 py-4 transition-all md:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      {/* Logo row + collapse toggle centered on the right border line */}
      <div className="relative mb-5 flex h-7 items-center pl-1">
        {collapsed ? (
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
            <circle cx="16" cy="16" r="15" fill="#006BFF" />
            <circle cx="16" cy="16" r="8.5" fill="none" stroke="white" strokeWidth="3" />
          </svg>
        ) : (
          <CalendlyLogo />
        )}

        <Button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute right-4 top-1/2 z-10  flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center border border-none justify-center rounded-full  bg-white text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <CreateEventMenu align="start">
        <Button
          variant="outline"
          className={cn(
            'mb-5 h-11 rounded-full border border-muted-foreground font-semibold shadow-sm hover:bg-muted',
            collapsed ? 'w-[85%]' : 'w-full justify-center',
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && 'Create'}
        </Button>
      </CreateEventMenu>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === '/' }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold  transition-colors hover:bg-muted',
              collapsed && 'justify-center px-0',
            )}
            activeProps={{ className: 'bg-[#eef2ff] text-[#006BFF] hover:bg-[#eef2ff]' }}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
