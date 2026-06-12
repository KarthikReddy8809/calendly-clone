import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import type { Meeting } from '@calendly/shared';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/common/empty-state';
import { ListSkeleton } from '@/components/common/loaders';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useCancelMeeting, useMeetings } from '../hooks/use-meetings';
import { MeetingItem } from '../components/meeting-item';

type Scope = 'upcoming' | 'past' | 'cancelled';

const EMPTY_COPY: Record<Scope, { title: string; description: string }> = {
  upcoming: {
    title: 'No upcoming meetings',
    description: 'When invitees book time with you, their meetings will appear here.',
  },
  past: { title: 'No past meetings', description: 'Completed meetings will show up here.' },
  cancelled: {
    title: 'No cancelled meetings',
    description: 'Meetings you cancel will be listed here.',
  },
};

function MeetingsList({ scope, onCancel }: { scope: Scope; onCancel: (m: Meeting) => void }) {
  const { data, isLoading, isError } = useMeetings({ scope });

  if (isLoading) return <ListSkeleton count={4} />;
  if (isError) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Couldn't load meetings"
        description="There was a problem reaching the server. Make sure the API is running."
      />
    );
  }
  if (!data || data.length === 0) {
    return <EmptyState icon={CalendarDays} {...EMPTY_COPY[scope]} />;
  }

  return (
    <div className="space-y-3">
      {data.map((meeting) => (
        <MeetingItem
          key={meeting.id}
          meeting={meeting}
          onCancel={scope === 'upcoming' ? onCancel : undefined}
        />
      ))}
    </div>
  );
}

export function MeetingsPage() {
  const [scope, setScope] = useState<Scope>('upcoming');
  const [cancelling, setCancelling] = useState<Meeting | null>(null);
  const cancelMutation = useCancelMeeting();

  const handleCancel = () => {
    if (!cancelling) return;
    cancelMutation.mutate(
      { id: cancelling.id, payload: {} },
      { onSuccess: () => setCancelling(null) },
    );
  };

  return (
    <div>
      <PageHeader title="Meetings" description="See and manage events booked with you." />

      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <MeetingsList scope="upcoming" onCancel={setCancelling} />
        </TabsContent>
        <TabsContent value="past">
          <MeetingsList scope="past" onCancel={setCancelling} />
        </TabsContent>
        <TabsContent value="cancelled">
          <MeetingsList scope="cancelled" onCancel={setCancelling} />
        </TabsContent>
      </Tabs>

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
