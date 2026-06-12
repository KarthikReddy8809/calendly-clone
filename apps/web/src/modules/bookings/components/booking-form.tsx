import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
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
  onBack: () => void;
  onSubmit: (values: BookingFormValues) => void;
  isSubmitting?: boolean;
}

export function BookingForm({ onBack, onSubmit, isSubmitting }: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { inviteeName: '', inviteeEmail: '', inviteeNotes: '' },
  });

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-primary" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <h2 className="mb-4 text-lg font-semibold">Enter Details</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="inviteeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
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
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inviteeNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please share anything that will help prepare for our meeting.</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Schedule Event
          </Button>
        </form>
      </Form>
    </div>
  );
}
