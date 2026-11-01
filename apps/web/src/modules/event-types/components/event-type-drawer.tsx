import { useEffect, useState, type ReactNode } from 'react';
import { CalendarClock, ChevronDown, Clock, Globe, Plus, X } from 'lucide-react';
import { EVENT_COLORS, EVENT_DURATIONS } from '@calendly/shared';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, initials } from '@/lib/utils';
import { useCurrentUser } from '@/modules/auth/hooks/use-auth';
import { useAvailability } from '@/modules/availability/hooks/use-availability';
import { availabilityByDay, summarizeAvailability } from '@/modules/availability/lib/summary';
import { Link } from '@tanstack/react-router';
import { useCreateEventType, useUpdateEventType } from '../hooks/use-event-types';
import { EVENT_KIND_LABELS, useEventEditorStore } from '../stores/event-editor-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DEFAULT_COLOR = '#8247f5';

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `${base || 'event'}-${Math.random().toString(36).slice(2, 7)}`;
}

interface SectionProps {
  title: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children?: ReactNode;
}

function Section({ title, summary, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border px-5 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[15px] font-semibold">{title}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      {summary && !open && <div className="mt-1.5 text-sm text-muted-foreground">{summary}</div>}
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function EventTypeDrawer() {
  const { isOpen, mode, kind, editing, close } = useEventEditorStore();
  const { data: user } = useCurrentUser();
  const hostName = user?.name ?? '';
  // Same cache as the Availability tab, so edits there show up here at once.
  const { data: availability } = useAvailability();
  const availabilityRules = availability?.rules ?? [];
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();

  const [title, setTitle] = useState('New Meeting');
  const [duration, setDuration] = useState<number>(30);
  const [extraDurations, setExtraDurations] = useState<number[]>([]);
  const [durationMenuOpen, setDurationMenuOpen] = useState(false);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);

  const availableDurations = EVENT_DURATIONS.filter(
    (d) => d !== duration && !extraDurations.includes(d),
  );

  const addDuration = (value: number) => {
    setExtraDurations((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setDurationMenuOpen(false);
  };
  const removeDuration = (value: number) =>
    setExtraDurations((prev) => prev.filter((d) => d !== value));

  useEffect(() => {
    if (!isOpen) return;
    setExtraDurations([]);
    if (mode === 'edit' && editing) {
      setTitle(editing.title);
      setDuration(editing.durationMinutes);
      setColor(editing.color);
    } else {
      setTitle('New Meeting');
      setDuration(30);
      setColor(DEFAULT_COLOR);
    }
  }, [isOpen, mode, editing]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (mode === 'edit' && editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          payload: { title, durationMinutes: duration, color },
        },
        { onSuccess: () => close() },
      );
    } else {
      createMutation.mutate(
        {
          title,
          slug: slugify(title),
          durationMinutes: duration,
          color: (EVENT_COLORS as readonly string[]).includes(color) ? color : DEFAULT_COLOR,
          isActive: true,
        },
        { onSuccess: () => close() },
      );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent className="p-0">
        <SheetTitle className="sr-only">
          {mode === 'edit' ? 'Edit event type' : 'New event type'}
        </SheetTitle>
        {/* Header */}
        <div className="border-b border-border px-5 pb-4 pt-5">
          <p className="text-xs text-muted-foreground">Event type</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-bold tracking-tight outline-none focus:rounded focus:bg-muted focus:px-1"
              placeholder="Event name"
            />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{EVENT_KIND_LABELS[kind]}</p>
        </div>

        <div className="flex-2 overflow-y-auto">
          <Section
            title="Duration"
            defaultOpen
            summary={
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {duration} min
              </span>
            }
          >
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {extraDurations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {extraDurations.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-sm"
                  >
                    {d} min
                    <button
                      type="button"
                      onClick={() => removeDuration(d)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${d} min option`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <Popover open={durationMenuOpen} onOpenChange={setDurationMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={availableDurations.length === 0}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#006BFF] hover:underline disabled:opacity-50 disabled:hover:no-underline"
                >
                  <Plus className="h-4 w-4" />
                  Add duration option
                  <ChevronDown className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-44 p-1">
                {availableDurations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => addDuration(d)}
                    className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    {d} min
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </Section>

          <Section
            title="Availability"
            summary={
              availability ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
                  {summarizeAvailability(availabilityRules)}
                </span>
              ) : (
                'Loading…'
              )
            }
          >
            {availabilityRules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have no available hours yet, so nobody can book this event.
              </p>
            ) : (
              <dl className="space-y-1.5 text-sm">
                {availabilityByDay(availabilityRules).map(({ day, hours }) => (
                  <div key={day} className="flex gap-3">
                    <dt className="w-10 shrink-0 font-medium">{day}</dt>
                    <dd className="text-muted-foreground">{hours}</dd>
                  </div>
                ))}
              </dl>
            )}
            {availability && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" aria-hidden /> {availability.timezone}
              </p>
            )}
            <Link
              to="/availability"
              onClick={close}
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Edit availability
            </Link>
          </Section>

          <Section
            title="Host"
            summary={
              <span className="inline-flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-[#eef2ff] text-[10px] text-[#006BFF]">
                    {initials(hostName)}
                  </AvatarFallback>
                </Avatar>
                {hostName} (you)
              </span>
            }
          >
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[#eef2ff] text-xs text-[#006BFF]">
                  {initials(hostName)}
                </AvatarFallback>
              </Avatar>
              {hostName} (you)
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button type="button" className="text-sm font-medium text-primary hover:underline">
            More options
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
              {mode === 'edit' ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
