import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import { TIMEZONE_OPTIONS, timezoneLabel } from '../lib/timezones';

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function currentTime(tz: string): string {
  try {
    return dayjs().tz(tz).format('h:mma');
  } catch {
    return '';
  }
}

/** Calendly-style timezone picker: a blue inline link that opens a searchable
 *  list showing the current local time for each zone. */
export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = TIMEZONE_OPTIONS.filter((tz) =>
    tz.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {timezoneLabel(value)}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <div className="relative mb-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-9 pl-9"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.map((tz) => {
            const selected = tz.value === value;
            return (
              <button
                key={tz.value}
                type="button"
                onClick={() => {
                  onChange(tz.value);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent',
                )}
              >
                <span>{tz.label}</span>
                <span
                  className={cn(
                    'text-xs',
                    selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {currentTime(tz.value)}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No matching timezones</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
