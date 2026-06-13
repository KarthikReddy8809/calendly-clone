import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TIME_OPTIONS, formatTimeLabel, toMinutes } from '../lib/time';

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Only show options strictly after this time (used for end-time pickers). */
  minExclusive?: string;
  /** Only show options strictly before this time (used for start-time pickers). */
  maxExclusive?: string;
}

/** Calendly-style time picker rendered as a compact pill with a scrollable
 *  15-minute increment dropdown. */
export function TimeSelect({ value, onChange, minExclusive, maxExclusive }: TimeSelectProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const options = TIME_OPTIONS.filter((o) => {
    if (minExclusive && toMinutes(o.value) <= toMinutes(minExclusive)) return false;
    if (maxExclusive && toMinutes(o.value) >= toMinutes(maxExclusive)) return false;
    return true;
  });

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-[88px] rounded-md bg-muted px-3 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {formatTimeLabel(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[120px] p-1"
      >
        <div ref={listRef} className="max-h-60 overflow-y-auto">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                data-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent',
                  selected && 'bg-primary/10 font-semibold text-primary',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
