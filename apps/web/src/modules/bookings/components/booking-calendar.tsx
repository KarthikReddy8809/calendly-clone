import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dayjs } from '@/lib/dayjs';

interface BookingCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Month-grid date picker for the public booking page. */
export function BookingCalendar({ selectedDate, onSelectDate }: BookingCalendarProps) {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'));
  const today = dayjs().startOf('day');

  const startOfGrid = cursor.startOf('month').startOf('week');
  const days = Array.from({ length: 42 }, (_, i) => startOfGrid.add(i, 'day'));

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{cursor.format('MMMM YYYY')}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCursor(cursor.subtract(1, 'month'))}
            disabled={cursor.isSame(today, 'month')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCursor(cursor.add(1, 'month'))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="py-2">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = day.isSame(cursor, 'month');
          const isPast = day.isBefore(today, 'day');
          const iso = day.format('YYYY-MM-DD');
          const isSelected = iso === selectedDate;
          const disabled = isPast || !inMonth;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(iso)}
              className={cn(
                'flex h-10 items-center justify-center rounded-full text-sm transition-colors',
                !inMonth && 'invisible',
                disabled && inMonth && 'cursor-not-allowed text-muted-foreground/40',
                !disabled && 'font-medium text-primary hover:bg-primary/10',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
              )}
            >
              {day.format('D')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
