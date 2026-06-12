import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dayjs } from '@/lib/dayjs';

interface BookingCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Month-grid date picker (Monday-first) for the public booking page. */
export function BookingCalendar({ selectedDate, onSelectDate }: BookingCalendarProps) {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'));
  const today = dayjs().startOf('day');

  const firstOfMonth = cursor.startOf('month');
  const offset = (firstOfMonth.day() + 6) % 7; // days back to Monday
  const startOfGrid = firstOfMonth.subtract(offset, 'day');
  const days = Array.from({ length: 42 }, (_, i) => startOfGrid.add(i, 'day'));

  return (
    <div className="w-full">
      <div className="relative mb-4 flex h-8 items-center justify-center">
        <button
          type="button"
          onClick={() => setCursor(cursor.subtract(1, 'month'))}
          disabled={cursor.isSame(today, 'month')}
          aria-label="Previous month"
          className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-base font-semibold text-foreground">{cursor.format('MMMM YYYY')}</h3>
        <button
          type="button"
          onClick={() => setCursor(cursor.add(1, 'month'))}
          aria-label="Next month"
          className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-2">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = day.isSame(cursor, 'month');
          const isPast = day.isBefore(today, 'day');
          const iso = day.format('YYYY-MM-DD');
          const isSelected = iso === selectedDate;
          const disabled = isPast || !inMonth;

          return (
            <div key={iso} className="flex items-center justify-center py-1">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelectDate(iso)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors',
                  !inMonth && 'invisible',
                  disabled && inMonth && 'cursor-not-allowed text-muted-foreground/40',
                  !disabled && !isSelected && 'bg-[#eff3fe] font-bold text-[#006bff] hover:bg-[#dde7fd]',
                  isSelected && 'bg-[#006bff] font-bold text-white hover:bg-[#0057d8]',
                )}
              >
                {day.format('D')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
