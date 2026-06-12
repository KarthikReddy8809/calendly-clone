import type { BookingSlot } from '@calendly/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { dayjs } from '@/lib/dayjs';

interface SlotListProps {
  date: string | null;
  timezone: string;
  slots: BookingSlot[] | undefined;
  isLoading: boolean;
  selectedSlot: string | null;
  onSelect: (startTime: string) => void;
  onConfirm: (startTime: string) => void;
}

export function SlotList({
  date,
  timezone,
  slots,
  isLoading,
  selectedSlot,
  onSelect,
  onConfirm,
}: SlotListProps) {
  if (!date) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Select a date to see available times.
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <p className="mb-3 text-center text-sm font-medium text-foreground">
        {dayjs(date).format('dddd, MMMM D')}
      </p>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && (!slots || slots.length === 0) && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No available times on this day.
        </p>
      )}

      {!isLoading && slots && slots.length > 0 && (
        <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
          {slots.map((slot) => {
            const isSelected = slot.startTime === selectedSlot;
            const label = dayjs(slot.startTime).tz(timezone).format('h:mma');

            if (isSelected) {
              return (
                <div key={slot.startTime} className="flex gap-2">
                  <button
                    type="button"
                    className="h-12 flex-1 rounded-md bg-neutral-700 text-sm font-semibold text-white"
                  >
                    {label}
                  </button>
                  <button
                    type="button"
                    onClick={() => onConfirm(slot.startTime)}
                    className="h-12 flex-1 rounded-md bg-[#006bff] text-sm font-semibold text-white transition-colors hover:bg-[#0057d8]"
                  >
                    Next
                  </button>
                </div>
              );
            }

            return (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => onSelect(slot.startTime)}
                className="h-12 w-full rounded-md border border-[#006bff]/40 text-sm font-semibold text-[#006bff] transition-colors hover:border-[#006bff] hover:bg-[#006bff]/5"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
