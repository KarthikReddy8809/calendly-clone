import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter, useSearch } from '@tanstack/react-router';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ApiRequestError } from '@/lib/api-client';
import { guessTimezone } from '@/lib/dayjs';
import { AuthShell } from '../components/auth-shell';
import { useSignup } from '../hooks/use-auth';
import { signupFormSchema, type SignupFormValues } from '../schemas/auth-form.schema';

const FORM_FIELDS = ['firstname', 'lastname', 'email', 'password'] as const;

function isFormField(name: string): name is (typeof FORM_FIELDS)[number] {
  return (FORM_FIELDS as readonly string[]).includes(name);
}

export function SignupPage() {
  const { redirect } = useSearch({ from: '/signup' });
  const router = useRouter();
  const signup = useSignup();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { firstname: '', lastname: '', email: '', password: '' },
  });

  const onSubmit = (values: SignupFormValues) => {
    signup.mutate(
      { ...values, timezone: guessTimezone() },
      {
        onSuccess: (user) => {
          toast.success(`Welcome, ${user.firstname ?? user.name}!`);
          router.history.push(redirect ?? '/');
        },
        onError: (error) => {
          if (!(error instanceof ApiRequestError)) {
            form.setError('root', { message: 'Could not create your account. Try again.' });
            return;
          }
          if (error.code === 'CONFLICT') {
            form.setError('email', { message: error.message });
            return;
          }
          const fieldErrors = error.fieldErrors?.filter((fe) => isFormField(fe.field)) ?? [];
          if (fieldErrors.length > 0) {
            fieldErrors.forEach((fe) => {
              if (isFormField(fe.field)) form.setError(fe.field, { message: fe.message });
            });
            return;
          }
          form.setError('root', { message: error.message });
        },
      },
    );
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <AuthShell
      title="Create your account"
      description="Share booking links and let people schedule time with you."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormDescription>At least 8 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {rootError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {rootError}
            </p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={signup.isPending}>
            {signup.isPending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
