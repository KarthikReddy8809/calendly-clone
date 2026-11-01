import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle2, CircleAlert, Video, X } from 'lucide-react';
import type { GoogleConnectResult } from '@calendly/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ApiRequestError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  useConnectGoogle,
  useDisconnectGoogle,
  useGoogleIntegration,
} from '../hooks/use-integrations';

/** What to tell the host after Google's consent screen sends them back. */
const RESULT_MESSAGES: Record<GoogleConnectResult, { ok: boolean; text: string }> = {
  connected: {
    ok: true,
    text: 'Google Calendar is connected. New bookings now get their own Google Meet link.',
  },
  denied: { ok: false, text: 'Google Calendar was not connected because access was declined.' },
  missing_scope: {
    ok: false,
    text: 'Calendar access was not granted. Connect again and keep the calendar permission checked.',
  },
  session_mismatch: {
    ok: false,
    text: 'The connection was started from a different account. Log in as the right host and try again.',
  },
  error: { ok: false, text: 'Could not connect Google Calendar. Please try again.' },
};

function GoogleCalendarMark() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white">
      <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden>
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="6"
          fill="#fff"
          stroke="#4285F4"
          strokeWidth="3"
        />
        <rect x="6" y="6" width="36" height="9" rx="4" fill="#4285F4" />
        <text x="24" y="36" textAnchor="middle" fontSize="16" fontWeight="700" fill="#4285F4">
          31
        </text>
      </svg>
    </div>
  );
}

export function IntegrationsPage() {
  const { google: result } = useSearch({ from: '/_dashboard/integrations' });
  const navigate = useNavigate();
  const { data: status, isLoading, isError } = useGoogleIntegration();
  const connect = useConnectGoogle();
  const disconnect = useDisconnectGoogle();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const banner = result ? RESULT_MESSAGES[result] : null;
  const dismissBanner = () =>
    void navigate({ to: '/integrations', search: { google: undefined }, replace: true });

  const handleConnect = () => {
    connect.mutate(undefined, {
      onError: (error) =>
        toast.error(
          error instanceof ApiRequestError ? error.message : 'Could not start connecting',
        ),
    });
  };

  const handleDisconnect = () => {
    disconnect.mutate(undefined, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success('Google Calendar disconnected');
      },
      onError: () => toast.error('Could not disconnect. Try again.'),
    });
  };

  return (
    <div className="w-full lg:px-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your calendar so every booking gets its own video meeting link.
        </p>
      </div>

      {banner && (
        <div
          role="status"
          className={cn(
            'mb-6 flex max-w-2xl items-start gap-3 rounded-lg border p-4 text-sm',
            banner.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-amber-900',
          )}
        >
          {banner.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <p className="flex-1">{banner.text}</p>
          <button
            type="button"
            onClick={dismissBanner}
            className="rounded p-0.5 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      <Card className="max-w-2xl">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-6">
          <GoogleCalendarMark />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Google Calendar and Google Meet</h2>
              {status?.connected && <Badge variant="secondary">Connected</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              When someone books any of your event types, we add it to your Google Calendar with a
              unique Meet link and include that link in the confirmation emails to you and your
              invitee.
            </p>

            {isLoading && <Skeleton className="mt-4 h-9 w-40" />}

            {isError && (
              <p className="mt-4 text-sm text-destructive">Could not load the connection status.</p>
            )}

            {status && !status.configured && (
              <p className="mt-4 flex items-start gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Google is not set up on this server yet. An admin needs to add the Google OAuth
                settings (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI).
              </p>
            )}

            {status?.configured && status.connected && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 truncate text-sm">
                  Connected as <span className="font-medium">{status.email}</span>
                </p>
                <Button
                  variant="outline"
                  className="shrink-0 rounded-full"
                  onClick={() => setConfirmOpen(true)}
                >
                  Disconnect
                </Button>
              </div>
            )}

            {status?.configured && !status.connected && (
              <Button
                className="mt-4 w-full rounded-full sm:w-auto"
                onClick={handleConnect}
                disabled={connect.isPending}
              >
                <Video className="h-4 w-4" aria-hidden />
                {connect.isPending ? 'Opening Google…' : 'Connect Google Calendar'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Disconnect Google Calendar?"
        description="New bookings will no longer get Google Meet links. Meetings already booked keep their links and calendar events."
        confirmLabel="Disconnect"
        destructive
        isLoading={disconnect.isPending}
        onConfirm={handleDisconnect}
      />
    </div>
  );
}
