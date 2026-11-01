import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter, useSearch } from '@tanstack/react-router';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiRequestError } from '@/lib/api-client';
import { AuthShell } from '../components/auth-shell';
import { useLogin } from '../hooks/use-auth';
import { loginFormSchema, type LoginFormValues } from '../schemas/auth-form.schema';

export function LoginPage() {
  const { redirect } = useSearch({ from: '/login' });
  const router = useRouter();
  const login = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => router.history.push(redirect ?? '/'),
      onError: (error) => {
        form.setError('root', {
          message:
            error instanceof ApiRequestError ? error.message : 'Could not log in. Try again.',
        });
      },
    });
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <AuthShell
      title="Log in to your account"
      description="Manage your event types, availability and meetings."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            search={{ redirect }}
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" autoFocus {...field} />
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
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {rootError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {rootError}
            </p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={login.isPending}>
            {login.isPending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
