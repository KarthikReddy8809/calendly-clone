import { createFileRoute } from '@tanstack/react-router';
import { AvailabilityPage } from '@/modules/availability/pages/availability-page';

export const Route = createFileRoute('/_dashboard/availability')({
  component: AvailabilityPage,
});
