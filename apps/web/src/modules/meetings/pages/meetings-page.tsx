import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ListFilter, Search, Settings, Upload } from 'lucide-react';
import type { Meeting } from '@calendly/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/common/empty-state';
import { ListSkeleton } from '@/components/common/loaders';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { dayjs } from '@/lib/dayjs';
import { useCancelMeeting, useMeetings } from '../hooks/use-meetings';
import { MeetingItem } from '../components/meeting-item';

function FeedDivider({ label }: { label: string }) {
  return (
    <div className="mt-8 flex items-center px-24">
      <div className="flex-1 border-t"></div>
      <p className="mx-4 text-sm text-muted-foreground whitespace-nowrap">{label}</p>
      <div className="flex-1 border-t border-muted"></div>
    </div>
  );
}

function groupByDay(meetings: Meeting[]) {
  const map = new Map<string, Meeting[]>();
  for (const meeting of meetings) {
    const key = dayjs(meeting.startTime).format('YYYY-MM-DD');
    map.set(key, [...(map.get(key) ?? []), meeting]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      weekday: dayjs(key).format('ddd'),
      date: dayjs(key).format('D MMM'),
      meetings: items,
    }));
}

export function MeetingsPage() {
  const [query, setQuery] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [cancelling, setCancelling] = useState<Meeting | null>(null);
  const cancelMutation = useCancelMeeting();

  const { data, isLoading, isError } = useMeetings({ scope: 'upcoming' });
  const { data: pastData, isLoading: pastLoading } = useMeetings(
    { scope: 'past' },
    { enabled: showPast },
  );

  const filterMeetings = (meetings: Meeting[]) => {
    const q = query.trim().toLowerCase();
    return meetings.filter(
      (m) =>
        !q ||
        m.eventType?.title?.toLowerCase().includes(q) ||
        m.inviteeName.toLowerCase().includes(q),
    );
  };

  const groups = useMemo(() => groupByDay(filterMeetings(data ?? [])), [data, query]);
  const pastGroups = useMemo(
    () => groupByDay(filterMeetings(pastData ?? [])),
    [pastData, query],
  );

  const handleCancel = () => {
    if (!cancelling) return;
    cancelMutation.mutate({ id: cancelling.id, payload: {} }, { onSuccess: () => setCancelling(null) });
  };

  const renderGroups = (items: typeof groups) =>
    items.map((group) => (
      <div key={group.key} className="mt-8 px-24">
        <h2 className="mb-3 text-base font-bold text-xl">
          <span className="text-foreground">{group.weekday}</span>{' '}
          <span className="text-muted-foreground">{group.date}</span>
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
          {group.meetings.map((meeting) => (
            <MeetingItem key={meeting.id} meeting={meeting} onCancel={setCancelling} />
          ))}
        </div>
      </div>
    ));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight px-24 border-b border-border pb-4">Meetings</h1>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3 px-24 border-b border-border pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-md font-medium">
              My Calendly <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>My Calendly</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings"
            className="h-9 rounded-md pl-9"
          />
        </div>

        <Button variant="outline" size="sm" className="rounded-md font-medium">
          <ListFilter className="h-4 w-4" /> Filter <ChevronDown className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-5">
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Upload className="h-4 w-4" /> Export meetings
          </button>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="mt-8">
        {!showPast ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full font-medium text-foreground"
              onClick={() => setShowPast(true)}
            >
              View more meetings
            </Button>
          </div>
        ) : pastLoading ? (
          <div className="mt-8">
            <ListSkeleton count={2} />
          </div>
        ) : (
          <>
            <FeedDivider label="No more past meetings" />
            {renderGroups(pastGroups)}
          </>
        )}

        {isLoading && <div className="mt-8"><ListSkeleton count={3} /></div>}

        {isError && (
          <EmptyState
            icon={CalendarDays}
            title="Couldn't load meetings"
            description="There was a problem reaching the server. Make sure the API is running."
          />
        )}

        {!isLoading && !isError && renderGroups(groups)}

        <FeedDivider label="No more upcoming meetings" />
      </div>

      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="Cancel this meeting?"
        description={`This will cancel "${cancelling?.eventType?.title}" with ${cancelling?.inviteeName}.`}
        confirmLabel="Cancel meeting"
        destructive
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}
