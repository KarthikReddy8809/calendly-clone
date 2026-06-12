import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { bookingFormSchema, type BookingFormValues } from '../schemas/booking-form.schema';

interface BookingFormProps {
  onSubmit: (values: BookingFormValues) => void;
  isSubmitting?: boolean;
}

export function BookingForm({ onSubmit, isSubmitting }: BookingFormProps) {
  const [showGuests, setShowGuests] = useState(false);
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { inviteeName: '', inviteeEmail: '', inviteeNotes: '' },
  });

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold">Enter Details</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="inviteeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inviteeEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Email *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showGuests ? (
            <FormItem>
              <FormLabel className="font-bold">Guest Email(s)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Add guest email" />
              </FormControl>
            </FormItem>
          ) : (
            <button
              type="button"
              onClick={() => setShowGuests(true)}
              className="rounded-full border border-[#006bff] px-4 py-1.5 text-sm font-semibold text-[#006bff] transition-colors hover:bg-[#006bff]/5"
            >
              Add guests
            </button>
          )}

          <FormField
            control={form.control}
            name="inviteeNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  Please share anything that will help prepare for our meeting.
                </FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-xs leading-relaxed text-muted-foreground">
            By proceeding, you confirm that you have read and agree to{' '}
            <a href="#" className="font-semibold text-foreground hover:underline">
              Calendly&apos;s Invitee Terms
            </a>{' '}
            and{' '}
            <a href="#" className="font-semibold text-foreground hover:underline">
              Privacy Notice
            </a>
            .
          </p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#006bff] px-6 font-semibold hover:bg-[#0057d8]"
          >
            Schedule Event
          </Button>
        </form>
      </Form>
    </div>
  );
}
