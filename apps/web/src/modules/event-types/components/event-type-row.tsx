import { Link } from '@tanstack/react-router';
import { CircleAlert, Copy, ExternalLink, Mail, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
import { TbLink } from 'react-icons/tb';
import { useCurrentUser } from '@/modules/auth/hooks/use-auth';
import { useAvailability } from '@/modules/availability/hooks/use-availability';
import { summarizeAvailability } from '@/modules/availability/lib/summary';

interface EventTypeRowProps {
  eventType: EventType;
  onEdit: (eventType: EventType) => void;
  onDelete: (eventType: EventType) => void;
}

export function EventTypeRow({ eventType, onEdit, onDelete }: EventTypeRowProps) {
  const { data: user } = useCurrentUser();
  const bookingUrl = `${window.location.origin}/book/${user?.username ?? ''}/${eventType.slug}`;
  const { data: availability } = useAvailability();

  const copyLink = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    toast.success('Link copied');
  };

  return (
    <Card className="group relative flex items-start gap-3 overflow-hidden py-4 pl-5 pr-2 transition-shadow hover:shadow-md sm:py-5 sm:pl-7 sm:pr-4">
      {/* Colored accent bar */}
      <span
        className="absolute left-0 top-0 h-full w-2"
        style={{ backgroundColor: eventType.color }}
      />

      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
        aria-label={`Select ${eventType.title}`}
      />

      <button onClick={() => onEdit(eventType)} className="min-w-0 flex-1 text-left">
        <h3 className="break-words font-semibold text-foreground">{eventType.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {eventType.durationMinutes} min · One-on-One
        </p>
        {availability && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {/* No hours means the booking page has no times to offer. */}
            {availability.rules.length === 0 && (
              <CircleAlert className="h-4 w-4 shrink-0 fill-amber-500 text-white" aria-hidden />
            )}
            {summarizeAvailability(availability.rules)}
          </p>
        )}
      </button>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground"
              aria-label={`Options for ${eventType.title}`}
            >
              <MoreVertical className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(eventType)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyLink}>
              <Copy className="h-4 w-4" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/send-mail" search={{ eventTypeId: eventType.id }}>
                <Mail className="h-4 w-4" /> Email link
              </Link>
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
