import { z } from 'zod';

export const bookingFormSchema = z.object({
  inviteeName: z.string().min(1, 'Name is required').max(120),
  inviteeEmail: z.string().email('Enter a valid email'),
  inviteeNotes: z.string().max(1000).optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
