import { z } from 'zod';

/** Most recipients one send can reach; keeps the endpoint from being used to spam. */
export const MAX_INVITATION_RECIPIENTS = 20;

export const invitationEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(255);

/** Host emails the public booking link of one of their event types to invitees. */
export const sendInvitationsSchema = z.object({
  eventTypeId: z.string().min(1, 'Pick an event type'),
  emails: z
    .array(invitationEmailSchema)
    .min(1, 'Add at least one email address')
    .max(
      MAX_INVITATION_RECIPIENTS,
      `Send to at most ${MAX_INVITATION_RECIPIENTS} people at a time`,
    ),
  message: z.string().trim().max(1000, 'Keep the message under 1000 characters').optional(),
});

export type SendInvitationsDto = z.infer<typeof sendInvitationsSchema>;

export const sendInvitationsResultSchema = z.object({
  bookingUrl: z.string(),
  sent: z.array(z.string()),
  failed: z.array(z.string()),
});

export type SendInvitationsResult = z.infer<typeof sendInvitationsResultSchema>;
