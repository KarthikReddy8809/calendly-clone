import { Clock, Globe, Video } from 'lucide-react';
import type { PublicEventType } from '@calendly/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dayjs } from '@/lib/dayjs';

interface EventSummaryProps {
  eventType: PublicEventType;
  timezone: string;
  selectedSlot?: string | null;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function EventSummary({ eventType, timezone, selectedSlot }: EventSummaryProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {eventType.host.avatarUrl && <AvatarImage src={eventType.host.avatarUrl} />}
          <AvatarFallback>{initials(eventType.host.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">{eventType.host.name}</p>
          <h1 className="text-xl font-bold">{eventType.title}</h1>
        </div>
      </div>

      {eventType.description && (
        <p className="text-sm text-muted-foreground">{eventType.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" /> {eventType.durationMinutes} min
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Video className="h-4 w-4" /> {eventType.locationType.replace('_', ' ')}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="h-4 w-4" /> {timezone}
        </div>
      </div>

      {selectedSlot && (
        <div className="rounded-lg bg-primary/5 p-3 text-sm font-medium text-primary">
          {dayjs(selectedSlot).tz(timezone).format('h:mm A, dddd, MMMM D, YYYY')}
        </div>
      )}
    </div>
  );
}
