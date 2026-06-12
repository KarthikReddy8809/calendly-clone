import { Clock, Mail, User, X } from 'lucide-react';
import type { Meeting } from '@calendly/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dayjs } from '@/lib/dayjs';

interface MeetingItemProps {
  meeting: Meeting;
  onCancel?: (meeting: Meeting) => void;
}

export function MeetingItem({ meeting, onCancel }: MeetingItemProps) {
  const start = dayjs(meeting.startTime).tz(meeting.inviteeTimezone);
  const end = dayjs(meeting.endTime).tz(meeting.inviteeTimezone);
  const color = meeting.eventType?.color ?? '#0069ff';

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-4">
        <div className="flex flex-col items-center justify-center rounded-lg bg-muted px-3 py-2 text-center">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {start.format('MMM')}
          </span>
          <span className="text-lg font-bold leading-tight">{start.format('D')}</span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="truncate font-semibold">
              {meeting.eventType?.title ?? 'Meeting'}
            </h3>
            {meeting.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {start.format('ddd, MMM D · h:mm A')} – {end.format('h:mm A')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {meeting.inviteeName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {meeting.inviteeEmail}
            </span>
          </div>
        </div>
      </div>

      {onCancel && meeting.status === 'confirmed' && (
        <Button variant="outline" size="sm" onClick={() => onCancel(meeting)}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      )}
    </Card>
  );
}
