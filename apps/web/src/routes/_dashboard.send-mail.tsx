import { createFileRoute } from '@tanstack/react-router';
import { SendMailPage } from '@/modules/invitations/pages/send-mail-page';
import { sendMailSearchSchema } from '@/modules/invitations/schemas/send-mail.schema';

export const Route = createFileRoute('/_dashboard/send-mail')({
  validateSearch: sendMailSearchSchema,
  component: SendMailPage,
});
