import { useEffect, useState } from 'react';
import { CalendarClock, Globe } from 'lucide-react';
import { COMMON_TIMEZONES } from '@calendly/shared';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { ListSkeleton } from '@/components/common/loaders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAvailability, useUpdateAvailability } from '../hooks/use-availability';
import {
  fromRules,
  toRules,
  WeeklyEditor,
  type DayRanges,
} from '../components/weekly-editor';

export function AvailabilityPage() {
  const { data, isLoading, isError } = useAvailability();
  const updateMutation = useUpdateAvailability();

  const [timezone, setTimezone] = useState('UTC');
  const [ranges, setRanges] = useState<DayRanges>({});

  useEffect(() => {
    if (data) {
      setTimezone(data.timezone);
      setRanges(fromRules(data.rules));
    }
  }, [data]);

  const handleSave = () => {
    updateMutation.mutate({ timezone, rules: toRules(ranges) });
  };

  return (
    <div>
      <PageHeader
        title="Availability"
        description="Set the weekly hours when invitees can book time with you."
        action={
          <Button onClick={handleSave} disabled={isLoading || updateMutation.isPending}>
            Save changes
          </Button>
        }
      />

      {isLoading && <ListSkeleton count={5} />}

      {isError && (
        <EmptyState
          icon={CalendarClock}
          title="Couldn't load availability"
          description="There was a problem reaching the server. Make sure the API is running."
        />
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-muted-foreground" /> Timezone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Weekly hours</h2>
            <WeeklyEditor value={ranges} onChange={setRanges} />
          </div>
        </div>
      )}
    </div>
  );
}
