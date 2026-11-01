import { createFileRoute } from '@tanstack/react-router';
import { EventTypesPage } from '@/modules/event-types/pages/event-types-page';

/** The Scheduling (event types) page is the app's home route. */
export const Route = createFileRoute('/_dashboard/')({
  component: EventTypesPage,
});
