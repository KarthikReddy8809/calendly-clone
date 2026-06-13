import { useEffect, useRef, useState } from 'react';
import {
  CalendarClock,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronDown,
  Copy,
  List,
  MoreVertical,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { ListSkeleton } from '@/components/common/loaders';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useEventTypes } from '@/modules/event-types/hooks/use-event-types';
import { useAvailability, useUpdateAvailability } from '../hooks/use-availability';
import { fromRules, toRules, WeeklyEditor, type DayRanges } from '../components/weekly-editor';
import { TimezoneSelect } from '../components/timezone-select';
import { AvailabilityCalendar } from '../components/availability-calendar';
import { ActiveOnPopover } from '../components/active-on-popover';
import { RenameScheduleDialog } from '../components/rename-schedule-dialog';

type ViewMode = 'list' | 'calendar';

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center rounded-md  bg-primary/10 p-1">
      {(
        [
          { id: 'list', label: 'List', icon: List },
          { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
        ] as const
      ).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm  font-medium transition-colors',
            value === id
              ? 'bg-white rounded-lg text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

export function AvailabilityPage() {
  const { data, isLoading, isError } = useAvailability();
  const updateMutation = useUpdateAvailability({ silent: true });
  const { data: eventTypes } = useEventTypes();

  const [timezone, setTimezone] = useState('America/New_York');
  const [ranges, setRanges] = useState<DayRanges>({});
  const [view, setView] = useState<ViewMode>('list');
  const [scheduleName, setScheduleName] = useState('Working hours');
  const [activeEventTypeIds, setActiveEventTypeIds] = useState<string[]>([]);
  const [renameOpen, setRenameOpen] = useState(false);

  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!data) return;
    setTimezone(data.timezone);
    const next = fromRules(data.rules);
    setRanges(next);
    lastSavedRef.current = JSON.stringify({ timezone: data.timezone, rules: toRules(next) });
  }, [data]);

  useEffect(() => {
    if (eventTypes && activeEventTypeIds.length === 0) {
      setActiveEventTypeIds(eventTypes.map((et) => et.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypes]);

  // Auto-save (debounced) whenever the weekly hours or timezone change.
  useEffect(() => {
    if (!data) return;
    const payload = { timezone, rules: toRules(ranges) };
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) return;
    const timer = setTimeout(() => {
      lastSavedRef.current = serialized;
      updateMutation.mutate(payload);
    }, 700);
    return () => clearTimeout(timer);
  }, [timezone, ranges, data, updateMutation]);

  return (
    <div className='w-full'>
      <h1 className="text-2xl font-bold tracking-tight px-48">Availability</h1>

      <Tabs defaultValue="schedules" className="mt-4 px-48">
        <TabsList>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="calendar-settings">Calendar settings</TabsTrigger>
          <TabsTrigger value="advanced-settings">Advanced settings</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          {isLoading && <ListSkeleton count={5} />}

          {isError && (
            <EmptyState
              icon={CalendarClock}
              title="Couldn't load availability"
              description="There was a problem reaching the server. Make sure the API is running."
            />
          )}

          {!isLoading && !isError && (
            <div className="rounded-xl border border-border bg-white shadow-sm">
              {/* Schedule header */}
              <div className="flex flex-wrap items-start justify-between gap-4 p-10">
                <div className="flex flex-col gap-3">
                  <div className='flex flex-col gap-2'>
                  <p className="text-xs font-bold text-muted-foreground">Schedule</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="mt-0.5 inline-flex items-center gap-1 text-lg font-bold text-primary">
                        {scheduleName} (default)
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[14rem]">
                      <DropdownMenuItem className="font-medium text-primary">
                        {scheduleName} (default)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                  <div className="mt-1">
                    <ActiveOnPopover
                      eventTypes={eventTypes ?? []}
                      selectedIds={activeEventTypeIds}
                      onApply={setActiveEventTypeIds}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ViewToggle value={view} onChange={setView} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[10rem]">
                      <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
                        <Pencil className="h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.success('Schedule duplicated')}>
                        <Copy className="h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="border-t border-border p-6">
                {view === 'list' ? (
                  <div className="grid gap-8 lg:grid-cols-2">
                    {/* Weekly hours */}
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h2 className="text-sm font-bold text-foreground">Weekly hours</h2>
                          <p className="text-xs text-muted-foreground">
                            Set when you are typically available for meetings
                          </p>
                        </div>
                      </div>

                      <WeeklyEditor value={ranges} onChange={setRanges} />

                      <div className="mt-4">
                        <TimezoneSelect value={timezone} onChange={setTimezone} />
                      </div>
                    </div>

                    {/* Date-specific hours */}
                    <div className="lg:pl-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h2 className="text-sm font-bold text-foreground">
                              Date-specific hours
                            </h2>
                            <p className="text-xs text-muted-foreground">
                              Adjust hours for specific days
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => toast.success('Add a date-specific override')}
                        >
                          + Hours
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <AvailabilityCalendar
                    value={ranges}
                    timezone={timezone}
                    onTimezoneChange={setTimezone}
                  />
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar-settings">
          <EmptyState
            icon={CalendarIcon}
            title="Calendar settings"
            description="Connect a calendar to automatically check for conflicts and add new events."
          />
        </TabsContent>

        <TabsContent value="advanced-settings">
          <EmptyState
            icon={CalendarClock}
            title="Advanced settings"
            description="Fine-tune buffers, minimum notice, and daily limits for your bookings."
          />
        </TabsContent>
      </Tabs>

      <RenameScheduleDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        value={scheduleName}
        onSave={setScheduleName}
      />
    </div>
  );
}
