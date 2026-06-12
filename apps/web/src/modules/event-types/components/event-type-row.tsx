import { Clock, Copy, ExternalLink, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { EventType } from '@calendly/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { LOCATION_LABELS } from '../schemas/event-type-form.schema';
import { TbLink } from 'react-icons/tb';

interface EventTypeRowProps {
  eventType: EventType;
  onEdit: (eventType: EventType) => void;
  onDelete: (eventType: EventType) => void;
}

export function EventTypeRow({ eventType, onEdit, onDelete }: EventTypeRowProps) {
  const bookingUrl = `${window.location.origin}/book/${eventType.slug}`;
  const locationLabel = eventType.locationValue
    ? LOCATION_LABELS[eventType.locationType]
    : 'No location set';

  const copyLink = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    toast.success('Link copied');
  };

  return (
    <Card className="group relative flex items-start gap-3 overflow-hidden py-5 pl-7 pr-4 transition-shadow hover:shadow-md">
      {/* Colored accent bar */}
      <span
        className="absolute left-0 top-0 h-full w-2"
        style={{ backgroundColor: eventType.color }}
      />

      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-[#006BFF]"
        aria-label={`Select ${eventType.title}`}
      />

      <button onClick={() => onEdit(eventType)} className="min-w-0 flex-1 text-left">
        <h3 className="font-semibold text-foreground">{eventType.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          {eventType.durationMinutes} min · {locationLabel} · One-on-One
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tue, Wed, Thu, Fri, Sat, Sun, hours vary
        </p>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="hidden rounded-full border border-muted-foreground sm:inline-flex"
          onClick={copyLink}
        >
          <TbLink className="h-3.5 w-3.5" /> Copy link
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground"
          asChild
        >
          <a href={bookingUrl} target="_blank" rel="noreferrer" aria-label="Open booking page">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(eventType)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyLink}>
              <Copy className="h-4 w-4" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(eventType)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
