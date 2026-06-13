import { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import { formatTimeLabel } from '../lib/time';
import { TimezoneSelect } from './timezone-select';
import type { DayRanges } from './weekly-editor';

interface AvailabilityCalendarProps {
  value: DayRanges;
  timezone: string;
  onTimezoneChange: (tz: string) => void;
}

const WEEKDAY_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** Month grid that projects the recurring weekly hours onto each calendar day. */
export function AvailabilityCalendar({
  value,
  timezone,
  onTimezoneChange,
}: AvailabilityCalendarProps) {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'));

  const monthStart = cursor.startOf('month');
  const gridStart = monthStart.startOf('week');
  const today = dayjs();

  const cells = Array.from({ length: 42 }, (_, i) => gridStart.add(i, 'day'));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCursor((c) => c.subtract(1, 'month'))}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[8rem] text-center text-base font-bold text-foreground">
            {cursor.format('MMMM YYYY')}
          </span>
          <button
            type="button"
            onClick={() => setCursor((c) => c.add(1, 'month'))}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <TimezoneSelect value={timezone} onChange={onTimezoneChange} />
      </div>

      <div className="grid grid-cols-7 border-l border-t border-border">
        {WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className="border-b border-r border-border py-2 text-center text-xs font-semibold text-muted-foreground"
          >
            {label}
          </div>
        ))}

        {cells.map((date) => {
          const weekday = date.day();
          const ranges = value[weekday] ?? [];
          const inMonth = date.month() === cursor.month();
          const isToday = date.isSame(today, 'day');

          return (
            <div
              key={date.format('YYYY-MM-DD')}
              className={cn(
                'relative min-h-[92px] border-b border-r border-border p-2',
                !inMonth && 'bg-muted/30',
              )}
            >
              {isToday && (
                <span className="pointer-events-none absolute inset-0 border-2 border-primary" />
              )}
              <div className="mb-1 flex items-start justify-between">
                <span
                  className={cn(
                    'text-sm',
                    inMonth ? 'text-foreground' : 'text-muted-foreground/60',
                  )}
                >
                  {date.date()}
                </span>
                {ranges.length > 0 && (
                  <RefreshCw className="h-3 w-3 text-muted-foreground/70" />
                )}
              </div>
              <div className="space-y-0.5">
                {ranges.map((range, index) => (
                  <p
                    key={index}
                    className={cn(
                      'text-[11px] leading-tight',
                      inMonth ? 'text-primary' : 'text-muted-foreground/50',
                    )}
                  >
                    {formatTimeLabel(range.startTime)} – {formatTimeLabel(range.endTime)}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
