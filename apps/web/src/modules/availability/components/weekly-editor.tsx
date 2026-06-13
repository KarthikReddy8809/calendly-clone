import { useState } from 'react';
import { Copy, PlusCircle, X } from 'lucide-react';
import { WEEKDAYS, type AvailabilityRule } from '@calendly/shared';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TimeSelect } from './time-select';

export type DayRanges = Record<number, { startTime: string; endTime: string }[]>;

interface WeeklyEditorProps {
  value: DayRanges;
  onChange: (value: DayRanges) => void;
}

function DayBadge({ letter, muted }: { letter: string; muted?: boolean }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs p-2 font-semibold',
        muted ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background',
      )}
    >
      {letter}
    </span>
  );
}

function CopyTimesPopover({
  weekday,
  onApply,
}: {
  weekday: number;
  onApply: (targets: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([weekday]);

  const toggle = (day: number) => {
    if (day === weekday) return;
    setSelected((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected([weekday]);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy times to other days"
        >
          <Copy className="h-[18px] w-[18px]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Copy times to...
        </p>
        <div className="space-y-1">
          {WEEKDAYS.map((day) => {
            const isSelf = day.value === weekday;
            const checked = selected.includes(day.value);
            return (
              <label
                key={day.value}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                  isSelf && 'cursor-not-allowed opacity-60',
                )}
              >
                <span>{day.label}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isSelf}
                  onChange={() => toggle(day.value)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
              </label>
            );
          })}
        </div>
        <Button
          className="mt-3 w-full"
          size="sm"
          onClick={() => {
            onApply(selected.filter((d) => d !== weekday));
            setOpen(false);
          }}
        >
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  );
}

/** Calendly-style weekly hours editor: one row per weekday with time ranges,
 *  per-day add/remove, and copy-to-other-days. */
export function WeeklyEditor({ value, onChange }: WeeklyEditorProps) {
  const updateRange = (
    weekday: number,
    index: number,
    field: 'startTime' | 'endTime',
    time: string,
  ) => {
    const next = { ...value };
    const ranges = [...(next[weekday] ?? [])];
    ranges[index] = { ...ranges[index]!, [field]: time };
    next[weekday] = ranges;
    onChange(next);
  };

  const addRange = (weekday: number) => {
    const next = { ...value };
    const existing = next[weekday] ?? [];
    const last = existing[existing.length - 1];
    const start = last ? last.endTime : '09:00';
    next[weekday] = [...existing, { startTime: start, endTime: '17:00' }];
    onChange(next);
  };

  const removeRange = (weekday: number, index: number) => {
    const next = { ...value };
    next[weekday] = (next[weekday] ?? []).filter((_, i) => i !== index);
    onChange(next);
  };

  const copyTimes = (from: number, targets: number[]) => {
    const next = { ...value };
    const source = (next[from] ?? []).map((r) => ({ ...r }));
    for (const target of targets) next[target] = source.map((r) => ({ ...r }));
    onChange(next);
  };

  return (
    <div className="space-y-1">
      {WEEKDAYS.map((day) => {
        const ranges = value[day.value] ?? [];
        const enabled = ranges.length > 0;
        const letter = day.short.charAt(0);

        if (!enabled) {
          return (
            <div key={day.value} className="flex flex-row items-center  gap-4 py-2">
              <DayBadge letter={letter} />
              <p className=" text-sm text-muted-foreground">Unavailable</p>
              <Button
                type="button"
                onClick={() => addRange(day.value)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground  hover:text-foreground"
                aria-label={`Add hours for ${day.label}`}
              >
                <PlusCircle className="h-[18px] w-[18px]" />
              </Button>
            </div>
          );
        }

        return (
          <div key={day.value} className="flex flex-row items-center gap-4 py-3">
            <DayBadge letter={letter} />
            <div className="flex flex-1 flex-col gap-2">
              {ranges.map((range, index) => (
                <div key={index} className="flex items-center gap-4">
                  <TimeSelect
                    value={range.startTime}
                    maxExclusive={range.endTime}
                    onChange={(t) => updateRange(day.value, index, 'startTime', t)}
                  />
                  <span className="text-muted-foreground">–</span>
                  <TimeSelect
                    value={range.endTime}
                    minExclusive={range.startTime}
                    onChange={(t) => updateRange(day.value, index, 'endTime', t)}
                  />
                  <button
                    type="button"
                    onClick={() => removeRange(day.value, index)}
                    className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Remove interval"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                  {index === 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => addRange(day.value)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Add interval"
                      >
                        <PlusCircle className="h-[18px] w-[18px]" />
                      </button>
                      <CopyTimesPopover
                        weekday={day.value}
                        onApply={(targets) => copyTimes(day.value, targets)}
                      />
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Flattens the editor's day map back into the API rule array. */
export function toRules(value: DayRanges): AvailabilityRule[] {
  return Object.entries(value).flatMap(([weekday, ranges]) =>
    ranges.map((range) => ({
      weekday: Number(weekday),
      startTime: range.startTime,
      endTime: range.endTime,
    })),
  );
}

/** Builds the editor's day map from the API rule array. */
export function fromRules(rules: AvailabilityRule[]): DayRanges {
  const map: DayRanges = {};
  for (const day of WEEKDAYS) map[day.value] = [];
  for (const rule of rules) {
    map[rule.weekday] = [
      ...(map[rule.weekday] ?? []),
      { startTime: rule.startTime, endTime: rule.endTime },
    ];
  }
  return map;
}
