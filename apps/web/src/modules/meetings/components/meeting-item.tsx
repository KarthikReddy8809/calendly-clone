import type { Meeting } from '@calendly/shared';
import type { Dayjs } from 'dayjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dayjs } from '@/lib/dayjs';
import { safeHttpsUrl } from '@/lib/utils';
import { Video } from 'lucide-react';

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
  const meetUrl = meeting.status === 'confirmed' ? safeHttpsUrl(meeting.meetUrl) : null;

  return (
    <div className="group flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
      <span className="shrink-0 text-sm text-muted-foreground sm:w-28">
        {startLabel(start)} – {end.format('h:mm a')}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <p className="min-w-0 text-sm sm:truncate">
          <span className="font-bold text-foreground">{meeting.eventType?.title ?? 'Meeting'}</span>
          <span className="text-muted-foreground"> with {meeting.inviteeName}</span>
        </p>
        {meeting.status === 'cancelled' && (
          <Badge variant="destructive" className="ml-2">
            Cancelled
          </Badge>
        )}
      </div>

      {meetUrl && (
        <a
          href={meetUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Join Google Meet"
          className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline sm:self-auto"
        >
          <Video className="h-4 w-4" aria-hidden />
          {/* Icon only on mid widths so the meeting title keeps its room. */}
          <span className="sm:hidden xl:inline">Join Meet</span>
        </a>
      )}

      {onCancel && meeting.status === 'confirmed' && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 self-start transition-opacity sm:self-auto md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100"
          onClick={() => onCancel(meeting)}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
