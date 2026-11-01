import { createFileRoute } from '@tanstack/react-router';
import { MeetingsPage } from '@/modules/meetings/pages/meetings-page';

export const Route = createFileRoute('/_dashboard/meetings')({
  component: MeetingsPage,
});
