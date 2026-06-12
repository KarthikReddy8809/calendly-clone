import { Calendar, Clock, Globe } from 'lucide-react';
import type { PublicEventType } from '@calendly/shared';
import { dayjs } from '@/lib/dayjs';

interface EventSummaryProps {
  eventType: PublicEventType;
  timezone: string;
  selectedSlot?: string | null;
}

function timezoneName(timezone: string) {
  return (
    new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'long' })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value ?? timezone
  );
}

export function EventSummary({ eventType, timezone, selectedSlot }: EventSummaryProps) {
  const start = selectedSlot ? dayjs(selectedSlot).tz(timezone) : null;
  const end = start ? start.add(eventType.durationMinutes, 'minute') : null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">{eventType.host.name}</p>
      <h1 className="text-[26px] font-bold leading-tight text-foreground">{eventType.title}</h1>

      {eventType.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{eventType.description}</p>
      )}

      <div className="space-y-3 pt-1 text-[15px] font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 shrink-0" /> {eventType.durationMinutes} min
        </div>

        {start && end && (
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              {start.format('h:mma')} - {end.format('h:mma')}, {start.format('dddd, MMMM D, YYYY')}
            </span>
          </div>
        )}

        {selectedSlot && (
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 shrink-0" /> {timezoneName(timezone)}
          </div>
        )}
      </div>
    </div>
  );
}
