import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { CalendarX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageLoader } from '@/components/common/loaders';
import { EmptyState } from '@/components/common/empty-state';
import { toast } from '@/components/ui/sonner';
import { ApiRequestError } from '@/lib/api-client';
import { guessTimezone } from '@/lib/dayjs';
import { useBookingSlots, useCreateBooking, usePublicEventType } from '../hooks/use-booking';
import { BookingCalendar } from '../components/booking-calendar';
import { SlotList } from '../components/slot-list';
import { EventSummary } from '../components/event-summary';
import { BookingForm } from '../components/booking-form';
import type { BookingFormValues } from '../schemas/booking-form.schema';
import { useBookingConfirmationStore } from '../stores/booking-confirmation-store';

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

  const handleSelectSlot = (startTime: string) => {
    setSelectedSlot(startTime);
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
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-[1fr_1.4fr]">
        <div className="border-b p-6 md:border-b-0 md:border-r md:p-8">
          <EventSummary eventType={eventType} timezone={timezone} selectedSlot={selectedSlot} />
        </div>

        <div className="p-6 md:p-8">
          {step === 'pick' ? (
            <div className="grid gap-8 sm:grid-cols-[1.3fr_1fr]">
              <div>
                <h2 className="mb-4 text-lg font-semibold">Select a Date &amp; Time</h2>
                <BookingCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              </div>
              <SlotList
                date={selectedDate}
                timezone={timezone}
                slots={slotsQuery.data?.slots}
                isLoading={slotsQuery.isLoading}
                selectedSlot={selectedSlot}
                onSelect={handleSelectSlot}
              />
            </div>
          ) : (
            <BookingForm
              onBack={() => setStep('pick')}
              onSubmit={handleSubmit}
              isSubmitting={createBooking.isPending}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
