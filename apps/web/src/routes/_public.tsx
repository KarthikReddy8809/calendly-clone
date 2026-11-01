import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '@/components/layout/public-layout';

/** Pathless layout route for public booking pages. */
export const Route = createFileRoute('/_public')({
  component: PublicLayout,
});
