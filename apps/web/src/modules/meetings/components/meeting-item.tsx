import type { Meeting } from '@calendly/shared';
import type { Dayjs } from 'dayjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dayjs } from '@/lib/dayjs';

interface MeetingItemProps {
  meeting: Meeting;
  onCancel?: (meeting: Meeting) => void;
}

function startLabel(d: Dayjs) {
  return d.minute() === 0 ? d.format('h') : d.format('h:mm');
}

export function MeetingItem({ meeting, onCancel }: MeetingItemProps) {
  const start = dayjs(meeting.startTime).tz(meeting.inviteeTimezone);
  const end = dayjs(meeting.endTime).tz(meeting.inviteeTimezone);
  const color = meeting.eventType?.color ?? '#0069ff';

  return (
    <div className="group flex items-center gap-6 px-6 py-5">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">
        {startLabel(start)} – {end.format('h:mm a')}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <p className="truncate text-sm">
          <span className="font-bold text-foreground">
            {meeting.eventType?.title ?? 'Meeting'}
          </span>
          <span className="text-muted-foreground"> with {meeting.inviteeName}</span>
        </p>
        {meeting.status === 'cancelled' && (
          <Badge variant="destructive" className="ml-2">
            Cancelled
          </Badge>
        )}
      </div>

      {onCancel && meeting.status === 'confirmed' && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onCancel(meeting)}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
