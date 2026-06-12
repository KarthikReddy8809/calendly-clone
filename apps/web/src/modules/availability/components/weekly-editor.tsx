import { Plus, Trash2 } from 'lucide-react';
import { WEEKDAYS, type AvailabilityRule } from '@calendly/shared';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type DayRanges = Record<number, { startTime: string; endTime: string }[]>;

interface WeeklyEditorProps {
  value: DayRanges;
  onChange: (value: DayRanges) => void;
}

/** Calendly-style weekly hours editor: one row per weekday with time ranges. */
export function WeeklyEditor({ value, onChange }: WeeklyEditorProps) {
  const toggleDay = (weekday: number, enabled: boolean) => {
    const next = { ...value };
    next[weekday] = enabled ? [{ startTime: '09:00', endTime: '17:00' }] : [];
    onChange(next);
  };

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
    next[weekday] = [...(next[weekday] ?? []), { startTime: '09:00', endTime: '17:00' }];
    onChange(next);
  };

  const removeRange = (weekday: number, index: number) => {
    const next = { ...value };
    next[weekday] = (next[weekday] ?? []).filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="divide-y rounded-xl border">
      {WEEKDAYS.map((day) => {
        const ranges = value[day.value] ?? [];
        const enabled = ranges.length > 0;
        return (
          <div key={day.value} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
            <div className="flex w-40 shrink-0 items-center gap-3">
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => toggleDay(day.value, checked)}
              />
              <span className={cn('text-sm font-medium', !enabled && 'text-muted-foreground')}>
                {day.label}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {!enabled && <span className="py-2 text-sm text-muted-foreground">Unavailable</span>}
              {ranges.map((range, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={range.startTime}
                    onChange={(e) => updateRange(day.value, index, 'startTime', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={range.endTime}
                    onChange={(e) => updateRange(day.value, index, 'endTime', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRange(day.value, index)}
                    aria-label="Remove range"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {enabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit px-2 text-primary"
                  onClick={() => addRange(day.value)}
                >
                  <Plus className="h-4 w-4" /> Add interval
                </Button>
              )}
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
