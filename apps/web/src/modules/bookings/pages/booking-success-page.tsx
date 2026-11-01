import { Calendar, CheckCircle2, Clock, Globe, Mail, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import { safeHttpsUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useBookingConfirmationStore } from '../stores/booking-confirmation-store';

export function BookingSuccessPage() {
  const confirmation = useBookingConfirmationStore((s) => s.confirmation);
  const meetUrl = safeHttpsUrl(confirmation?.meetUrl);

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold">You are scheduled</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A confirmation email is on its way to you.
          </p>

          {confirmation ? (
            <>
              <div className="mt-6 space-y-3 rounded-xl border p-5 text-left">
                <h2 className="text-base font-semibold">{confirmation.eventTitle}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {dayjs(confirmation.startTime)
                    .tz(confirmation.inviteeTimezone)
                    .format('dddd, MMMM D, YYYY')}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {dayjs(confirmation.startTime)
                    .tz(confirmation.inviteeTimezone)
                    .format('h:mm A')}{' '}
                  – {dayjs(confirmation.endTime).tz(confirmation.inviteeTimezone).format('h:mm A')}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" /> {confirmation.inviteeTimezone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {confirmation.inviteeEmail}
                </div>
                {meetUrl && (
                  <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4 shrink-0" aria-hidden />
                    <a
                      href={meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-primary hover:underline"
                    >
                      {meetUrl.replace(/^https:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
              {meetUrl && (
                <Button asChild className="mt-5 w-full rounded-full sm:w-auto">
                  <a href={meetUrl} target="_blank" rel="noreferrer">
                    <Video className="h-4 w-4" aria-hidden /> Join Google Meet
                  </a>
                </Button>
              )}
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Your booking is confirmed. You can close this window.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
