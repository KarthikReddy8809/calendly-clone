import type { FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearch } from '@tanstack/react-router';
import { CalendarPlus, Copy, Mail, Send } from 'lucide-react';
import { MAX_INVITATION_RECIPIENTS } from '@calendly/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { EmptyState } from '@/components/common/empty-state';
import { ApiRequestError } from '@/lib/api-client';
import { useCurrentUser } from '@/modules/auth/hooks/use-auth';
import { useEventTypes } from '@/modules/event-types/hooks/use-event-types';
import { EmailChipsInput } from '../components/email-chips-input';
import { useSendInvitations } from '../hooks/use-invitations';
import { sendMailFormSchema, type SendMailFormValues } from '../schemas/send-mail.schema';

export function SendMailPage() {
  const search = useSearch({ from: '/_dashboard/send-mail' });
  const { data: user } = useCurrentUser();
  const { data: eventTypes, isLoading } = useEventTypes();
  const sendInvitations = useSendInvitations();

  const form = useForm<SendMailFormValues>({
    resolver: zodResolver(sendMailFormSchema),
    defaultValues: { eventTypeId: search.eventTypeId ?? '', emails: [], message: '' },
  });

  // Only active event types can be booked, so only those can be shared.
  const activeTypes = (eventTypes ?? []).filter((e) => e.isActive);
  const chosenId = form.watch('eventTypeId');
  const selected = activeTypes.find((e) => e.id === chosenId) ?? activeTypes[0];
  const bookingUrl =
    selected && user ? `${window.location.origin}/book/${user.username}/${selected.slug}` : '';
  const recipientCount = form.watch('emails').length;

  const copyLink = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    toast.success('Link copied');
  };

  const onValid = (values: SendMailFormValues) => {
    sendInvitations.mutate(
      { ...values, message: values.message?.trim() || undefined },
      {
        onSuccess: ({ sent, failed }) => {
          if (sent.length > 0) {
            toast.success(`Link sent to ${sent.length} ${sent.length === 1 ? 'person' : 'people'}`);
          }
          if (failed.length > 0) {
            // Keep the failed addresses so the host can retry them.
            form.setValue('emails', failed);
            form.setError('root', { message: `Could not send to: ${failed.join(', ')}` });
            return;
          }
          form.reset({ eventTypeId: values.eventTypeId, emails: [], message: '' });
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && error.fieldErrors?.length) {
            const emailError = error.fieldErrors.find((fe) => fe.field.startsWith('emails'));
            if (emailError) form.setError('emails', { message: emailError.message });
          }
          form.setError('root', {
            message: error instanceof ApiRequestError ? error.message : 'Could not send the email.',
          });
        },
      },
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // The select shows the first active event type until the host picks one.
    if (selected && form.getValues('eventTypeId') !== selected.id) {
      form.setValue('eventTypeId', selected.id);
    }
    void form.handleSubmit(onValid)(event);
  };

  const { errors } = form.formState;

  return (
    <div className="w-full lg:px-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Send mail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Email your booking link to invitees so they can pick a time.
        </p>
      </div>

      {isLoading && <Skeleton className="h-96 w-full max-w-2xl rounded-xl" />}

      {!isLoading && activeTypes.length === 0 && (
        <EmptyState
          icon={CalendarPlus}
          title="No event types to share"
          description="Create or turn on an event type first, then come back to email its link."
          action={
            <Button asChild className="rounded-full">
              <Link to="/">Go to Scheduling</Link>
            </Button>
          }
        />
      )}

      {!isLoading && selected && (
        <Card className="max-w-2xl">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="send-mail-event">Event type</Label>
                <Controller
                  control={form.control}
                  name="eventTypeId"
                  render={({ field }) => (
                    <Select value={selected.id} onValueChange={field.onChange}>
                      <SelectTrigger id="send-mail-event" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTypes.map((eventType) => (
                          <SelectItem key={eventType.id} value={eventType.id}>
                            {eventType.title} ({eventType.durationMinutes} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="send-mail-link">Public link</Label>
                <div className="flex gap-2">
                  <Input
                    id="send-mail-link"
                    value={bookingUrl}
                    readOnly
                    className="min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyLink}
                    className="shrink-0"
                    aria-label="Copy link"
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="send-mail-to">To</Label>
                <Controller
                  control={form.control}
                  name="emails"
                  render={({ field }) => (
                    <EmailChipsInput
                      id="send-mail-to"
                      value={field.value}
                      onChange={(emails) => {
                        field.onChange(emails);
                        form.clearErrors('emails');
                        form.clearErrors('root');
                      }}
                      max={MAX_INVITATION_RECIPIENTS}
                      invalid={Boolean(errors.emails)}
                      describedBy="send-mail-to-help"
                    />
                  )}
                />
                <p id="send-mail-to-help" className="text-xs text-muted-foreground">
                  Separate addresses with a comma or press Enter. Up to {MAX_INVITATION_RECIPIENTS}{' '}
                  at a time; each person gets their own email.
                </p>
                {errors.emails?.message && (
                  <p className="text-xs font-medium text-destructive">{errors.emails.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="send-mail-message">
                  Message <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="send-mail-message"
                  rows={4}
                  placeholder="Hi! Pick a time that works for you."
                  {...form.register('message')}
                />
                {errors.message?.message && (
                  <p className="text-xs font-medium text-destructive">{errors.message.message}</p>
                )}
              </div>

              {errors.root?.message && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {errors.root.message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  Replies go to {user?.email}
                </p>
                <Button
                  type="submit"
                  disabled={sendInvitations.isPending}
                  className="w-full rounded-full sm:w-auto"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {sendInvitations.isPending
                    ? 'Sending…'
                    : recipientCount > 1
                      ? `Send to ${recipientCount} people`
                      : 'Send'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
