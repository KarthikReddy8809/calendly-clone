import { useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEventEditorStore, type EventKind } from '../stores/event-editor-store';

interface MenuEntry {
  kind: EventKind;
  title: string;
  subtitle?: string;
  description: string;
}

const PRIMARY_ENTRIES: MenuEntry[] = [
  {
    kind: 'one_on_one',
    title: 'One-on-One',
    subtitle: '1 host → 1 invitee',
    description: 'Good for: coffee chats, 1:1 interviews, etc.',
  },
  {
    kind: 'group',
    title: 'Group',
    subtitle: '1 host → Multiple invitees',
    description: 'Good for: webinars, online classes, etc.',
  },
  {
    kind: 'round_robin',
    title: 'Round robin',
    subtitle: 'Rotating hosts → 1 invitee',
    description: 'Good for: distributing meetings between team members',
  },
  {
    kind: 'collective',
    title: 'Collective',
    subtitle: 'Multiple hosts → 1 invitee',
    description: 'Good for: panel interviews, group sales calls, etc.',
  },
];

const SECONDARY_ENTRIES: MenuEntry[] = [
  {
    kind: 'one_off',
    title: 'One-off meeting',
    description: 'Offer time outside your normal schedule',
  },
  {
    kind: 'meeting_poll',
    title: 'Meeting poll',
    description: 'Let invitees vote on a time to meet',
  },
];

function MenuItem({ entry, onSelect }: { entry: MenuEntry; onSelect: (kind: EventKind) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.kind)}
      className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-primary">{entry.title}</span>
        {entry.subtitle && (
          <span className="shrink-0 text-[11px] text-muted-foreground">{entry.subtitle}</span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{entry.description}</p>
    </button>
  );
}

/**
 * Calendly "Create" dropdown. Wraps any trigger and shows the event-type menu;
 * selecting an entry navigates to Scheduling and opens the editor drawer.
 */
export function CreateEventMenu({
  children,
  align = 'end',
}: {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const openCreate = useEventEditorStore((s) => s.openCreate);

  const handleSelect = (kind: EventKind) => {
    setOpen(false);
    void navigate({ to: '/' }).then(() => openCreate(kind));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-80">
        <p className={cn('px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground')}>
          Event type
        </p>
        {PRIMARY_ENTRIES.map((entry) => (
          <MenuItem key={entry.kind} entry={entry} onSelect={handleSelect} />
        ))}
        <div className="my-1 h-px bg-border" />
        <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          More ways to meet
        </p>
        {SECONDARY_ENTRIES.map((entry) => (
          <MenuItem key={entry.kind} entry={entry} onSelect={handleSelect} />
        ))}
      </PopoverContent>
    </Popover>
  );
}
