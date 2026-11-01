import { z } from 'zod';
import { sendInvitationsSchema } from '@calendly/shared';

/** The form uses the API contract as-is, so client and server agree on the rules. */
export const sendMailFormSchema = sendInvitationsSchema;
export type SendMailFormValues = z.input<typeof sendMailFormSchema>;

/** `/send-mail?eventTypeId=...` preselects an event type (from "Email link"). */
export const sendMailSearchSchema = z.object({
  eventTypeId: z.string().min(1).optional().catch(undefined),
});

const emailCheck = z.string().email();

/** Splits pasted or typed text on commas, semicolons and whitespace. */
export function splitEmails(text: string): { valid: string[]; invalid: string[] } {
  const parts = text
    .split(/[\s,;]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  return {
    valid: parts.filter((p) => emailCheck.safeParse(p).success),
    invalid: parts.filter((p) => !emailCheck.safeParse(p).success),
  };
}
