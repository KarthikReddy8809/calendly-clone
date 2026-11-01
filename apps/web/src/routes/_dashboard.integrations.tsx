import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { GOOGLE_CONNECT_RESULTS } from '@calendly/shared';
import { IntegrationsPage } from '@/modules/integrations/pages/integrations-page';

/** `?google=` is set by the API after Google's consent screen redirects back. */
const searchSchema = z.object({
  google: z.enum(GOOGLE_CONNECT_RESULTS).optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/integrations')({
  validateSearch: searchSchema,
  component: IntegrationsPage,
});
