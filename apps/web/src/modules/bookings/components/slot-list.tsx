import type { BookingSlot } from '@calendly/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { dayjs } from '@/lib/dayjs';

interface SlotListProps {
  date: string | null;
  timezone: string;
  slots: BookingSlot[] | undefined;
  isLoading: boolean;
  selectedSlot: string | null;
  onSelect: (startTime: string) => void;
}

export function SlotList({
  date,
  timezone,
  slots,
  isLoading,
  selectedSlot,
  onSelect,
}: SlotListProps) {
  if (!date) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Select a date to see available times.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No available times on this day.
      </p>
    );
  }

  return (
    <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
      <p className="pb-1 text-sm font-medium">{dayjs(date).format('dddd, MMMM D')}</p>
      {slots.map((slot) => {
        const isSelected = slot.startTime === selectedSlot;
        return (
          <Button
            key={slot.startTime}
            variant={isSelected ? 'default' : 'outline'}
            className="w-full justify-center"
            onClick={() => onSelect(slot.startTime)}
          >
            {dayjs(slot.startTime).tz(timezone).format('h:mm A')}
          </Button>
        );
      })}
    </div>
  );
}
