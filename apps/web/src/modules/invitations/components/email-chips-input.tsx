import { useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { splitEmails } from '../schemas/send-mail.schema';

interface EmailChipsInputProps {
  id?: string;
  value: string[];
  onChange: (emails: string[]) => void;
  max: number;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Type or paste addresses; Enter, comma, space or leaving the field turns
 * them into chips. Anything that is not an email stays in the box with a hint.
 */
export function EmailChipsInput({
  id,
  value,
  onChange,
  max,
  invalid,
  describedBy,
}: EmailChipsInputProps) {
  const [draft, setDraft] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  const commit = (text: string) => {
    const { valid, invalid: bad } = splitEmails(text);
    const merged = [...value];
    for (const email of valid) {
      if (!merged.includes(email) && merged.length < max) merged.push(email);
    }
    const dropped = valid.length - (merged.length - value.length);
    onChange(merged);
    setDraft(bad.join(' '));
    if (bad.length > 0) setHint(`Not a valid email: ${bad.join(', ')}`);
    else if (dropped > 0 && merged.length >= max) setHint(`You can add up to ${max} addresses.`);
    else setHint(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', ';', ' ', 'Tab'].includes(event.key) && draft.trim()) {
      event.preventDefault();
      commit(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    commit(`${draft} ${event.clipboardData.getData('text')}`);
  };

  return (
    <div>
      <div
        className={cn(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          invalid && 'border-destructive',
        )}
      >
        {value.map((email) => (
          <span
            key={email}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary py-1 pl-3 pr-1 text-sm text-secondary-foreground"
          >
            <span className="truncate">{email}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((e) => e !== email))}
              className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              aria-label={`Remove ${email}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={value.length === 0 ? 'name@example.com, another@example.com' : ''}
          aria-describedby={describedBy}
          aria-invalid={invalid || Boolean(hint)}
          className="min-w-[10rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {hint && (
        <p role="status" className="mt-1.5 text-xs font-medium text-destructive">
          {hint}
        </p>
      )}
    </div>
  );
}
