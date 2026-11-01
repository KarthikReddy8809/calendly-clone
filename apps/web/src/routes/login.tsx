import { createFileRoute, redirect } from '@tanstack/react-router';
import { queryClient } from '@/lib/query-client';
import { LoginPage } from '@/modules/auth/pages/login-page';
import { currentUserQueryOptions } from '@/modules/auth/hooks/use-auth';
import { authSearchSchema } from '@/modules/auth/schemas/auth-form.schema';

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ search }) => {
    const user = await queryClient.ensureQueryData(currentUserQueryOptions);
    if (user) throw redirect({ href: search.redirect ?? '/' });
  },
  component: LoginPage,
});
