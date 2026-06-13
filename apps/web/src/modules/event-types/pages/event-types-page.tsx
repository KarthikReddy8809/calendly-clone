import { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, HelpCircle, MoreHorizontal, Plus, Search } from 'lucide-react';
import type { EventType } from '@calendly/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useDeleteEventType, useEventTypes } from '../hooks/use-event-types';
import { EventTypeRow } from '../components/event-type-row';
import { CreateEventMenu } from '../components/create-event-menu';
import { useEventEditorStore } from '../stores/event-editor-store';

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function EventTypesPage() {
  const { data: eventTypes, isLoading } = useEventTypes();
  const deleteMutation = useDeleteEventType();
  const openEdit = useEventEditorStore((s) => s.openEdit);

  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState<EventType | null>(null);

  const filtered = useMemo(() => {
    if (!eventTypes) return [];
    const q = query.trim().toLowerCase();
    if (!q) return eventTypes;
    return eventTypes.filter((e) => e.title.toLowerCase().includes(q));
  }, [eventTypes, query]);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-2xl font-bold px-24 tracking-tight">
          Scheduling
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </h1>
        <CreateEventMenu>
          <Button className="rounded-full bg-[#006BFF] px-5 hover:bg-[#0057d8]">
            <Plus className="h-4 w-4" /> Create <ChevronDown className="h-4 w-4" />
          </Button>
        </CreateEventMenu>
      </div>

      {/* Tabs with full-width underline */}
      <Tabs defaultValue="event-types" className="px-24 mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="event-types">Event types</TabsTrigger>
          <TabsTrigger value="single-use">Single-use links</TabsTrigger>
          <TabsTrigger value="polls">Meeting polls</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative mt-6 max-w-md px-24">
        <Search className="absolute left-1/4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search event types"
          className="rounded-lg pl-9"
        />
      </div>

      {/* Host card */}
      <div className="mt-6 overflow-hidden px-24 bg-white">
        <div className="flex items-center justify-between  px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#eef2ff] text-sm text-[#006BFF]">K</AvatarFallback>
            </Avatar>
            <span className="font-semibold">Karthik Reddy</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-primary">
              <ExternalLink className="h-4 w-4" /> View landing page
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy landing page link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-3 px-5 pb-5">
          {isLoading && <ListSkeleton />}

          {!isLoading && filtered.length === 0 && (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium">No event types found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an event type for people to book on your calendar.
              </p>
              <CreateEventMenu align="center">
                <Button className="mt-4 rounded-full bg-[#006BFF] hover:bg-[#0057d8]">
                  <Plus className="h-4 w-4" /> Create
                </Button>
              </CreateEventMenu>
            </div>
          )}

          {!isLoading &&
            filtered.map((eventType) => (
              <EventTypeRow
                key={eventType.id}
                eventType={eventType}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            ))}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.title}?`}
        description="Users will be unable to schedule further meetings with deleted event types. Meetings previously scheduled will not be affected."
        confirmLabel="Yes"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
