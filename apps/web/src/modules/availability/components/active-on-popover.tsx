import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { EventType } from '@calendly/shared';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ActiveOnPopoverProps {
  eventTypes: EventType[];
  selectedIds: string[];
  onApply: (ids: string[]) => void;
}

/** "Active on: N event types" picker shown in the schedule header. */
export function ActiveOnPopover({ eventTypes, selectedIds, onApply }: ActiveOnPopoverProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<string[]>(selectedIds);

  const count = selectedIds.length;
  const filtered = eventTypes.filter((et) =>
    et.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const toggle = (id: string) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraft(selectedIds);
          setQuery('');
        }
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold">
          Active on:{' '}
          <span className="font-medium text-primary">
            {count} event type{count === 1 ? '' : 's'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-9 pl-9"
          />
        </div>

        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
          <button type="button" onClick={() => setDraft(eventTypes.map((et) => et.id))}>
            select all
          </button>
          <span className="text-muted-foreground">/</span>
          <button type="button" onClick={() => setDraft([])}>
            clear
          </button>
        </div>

        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Using working hours
        </p>
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {filtered.map((et) => {
            const checked = draft.includes(et.id);
            return (
              <label
                key={et.id}
                className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1.5 hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(et.id)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: et.color }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">{et.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {et.durationMinutes} mins
                  </span>
                </span>
              </label>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-1 py-2 text-sm text-muted-foreground">No event types found</p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
