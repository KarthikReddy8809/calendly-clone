import { useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, CalendarX, ChevronDown, Globe, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/common/loaders';
import { EmptyState } from '@/components/common/empty-state';
import { toast } from '@/components/ui/sonner';
import { ApiRequestError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { dayjs, guessTimezone } from '@/lib/dayjs';
import { useBookingSlots, useCreateBooking, usePublicEventType } from '../hooks/use-booking';
import { BookingCalendar } from '../components/booking-calendar';
import { SlotList } from '../components/slot-list';
import { EventSummary } from '../components/event-summary';
import { BookingForm } from '../components/booking-form';
import type { BookingFormValues } from '../schemas/booking-form.schema';
import { useBookingConfirmationStore } from '../stores/booking-confirmation-store';
import { sendBookingConfirmationEmail } from '../services/booking-email.service';

export function BookingPage() {
  const { slug } = useParams({ from: '/public/book/$slug' });
  const navigate = useNavigate();
  const setConfirmation = useBookingConfirmationStore((s) => s.setConfirmation);

  const [timezone] = useState(guessTimezone);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<'pick' | 'details'>('pick');

  const eventQuery = usePublicEventType(slug);
  const slotsQuery = useBookingSlots(slug, selectedDate ?? '', timezone, Boolean(selectedDate));
  const createBooking = useCreateBooking(slug);

  const timezoneLabel = useMemo(() => {
    const name =
      new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'long' })
        .formatToParts(new Date())
        .find((part) => part.type === 'timeZoneName')?.value ?? timezone;
    return `${name} (${dayjs().tz(timezone).format('h:mma')})`;
  }, [timezone]);

  if (eventQuery.isLoading) return <PageLoader />;
  if (eventQuery.isError || !eventQuery.data) {
    return (
      <EmptyState
        icon={CalendarX}
        title="This scheduling link isn't available"
        description="The event may have been removed or is no longer accepting bookings."
      />
    );
  }

  const eventType = eventQuery.data;

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (startTime: string) => {
    setSelectedSlot(startTime);
  };

  const handleConfirmSlot = () => {
    setStep('details');
  };

  const handleSubmit = (values: BookingFormValues) => {
    if (!selectedSlot) return;
    createBooking.mutate(
      {
        startTime: selectedSlot,
        inviteeName: values.inviteeName,
        inviteeEmail: values.inviteeEmail,
        inviteeNotes: values.inviteeNotes || null,
        inviteeTimezone: timezone,
      },
      {
        onSuccess: (confirmation) => {
          setConfirmation(confirmation);
          void sendBookingConfirmationEmail(confirmation, slug).catch(() => {
            toast.error('Booking confirmed, but the confirmation email could not be sent.');
          });
          void navigate({ to: '/book/$slug/success', params: { slug } });
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiRequestError ? error.message : 'Could not complete the booking',
          );
        },
      },
    );
  };

  return (
    <div
      className={cn(
        'mx-auto transition-[max-width] duration-300 ease-out',
        selectedDate && step === 'pick' ? 'max-w-[1080px]' : 'max-w-[820px]',
      )}
    >
      <Card className="relative overflow-hidden">
        {/* "Powered by Calendly" corner ribbon */}
        <span className="pointer-events-none absolute right-[-52px] top-[22px] z-10 w-[170px] rotate-45 bg-neutral-700 py-1.5 text-center text-[10px] font-medium leading-tight text-white shadow">
          Powered by <span className="font-semibold">Calendly</span>
        </span>

        <div className="grid md:grid-cols-[320px_1fr]">
          {/* Left: event summary + footer links */}
          <div className="flex flex-col border-b p-6 md:border-b-0 md:border-r md:p-8">
            {step === 'details' && (
              <button
                type="button"
                onClick={() => setStep('pick')}
                aria-label="Back"
                className="mb-4 flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <EventSummary
              eventType={eventType}
              timezone={timezone}
              selectedSlot={step === 'details' ? selectedSlot : null}
            />
            <div className="mt-auto hidden gap-4 pt-10 text-xs font-medium md:flex">
              <a href="#" className="text-primary hover:underline">
                Cookie settings
              </a>
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Right: date/time picker or booking form */}
          <div className="p-6 md:p-8">
            {step === 'pick' ? (
              <>
                <h2 className="mb-6 text-xl font-bold">Select a Date &amp; Time</h2>
                <div className={cn('grid gap-8', selectedDate && 'lg:grid-cols-[1fr_220px]')}>
                  <div>
                    <BookingCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />

                    <div className="mt-8">
                      <p className="mb-2 text-sm font-bold text-foreground">Time zone</p>
                      <button
                        type="button"
                        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Globe className="h-4 w-4" />
                        {timezoneLabel}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {selectedDate && (
                    <SlotList
                      date={selectedDate}
                      timezone={timezone}
                      slots={slotsQuery.data?.slots}
                      isLoading={slotsQuery.isLoading}
                      selectedSlot={selectedSlot}
                      onSelect={handleSelectSlot}
                      onConfirm={handleConfirmSlot}
                    />
                  )}
                </div>

                <div className="mt-10 flex justify-center md:justify-start">
                  <Button variant="outline" size="sm" className="rounded-full font-medium">
                    <Wrench className="h-4 w-4" /> Troubleshoot
                  </Button>
                </div>
              </>
            ) : (
              <BookingForm onSubmit={handleSubmit} isSubmitting={createBooking.isPending} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
