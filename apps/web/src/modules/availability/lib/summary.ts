import type { AvailabilityRule } from '@calendly/shared';
import { formatTimeLabel } from './time';

/** Monday-first, matching the booking calendar. 0 = Sunday. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SHORT_DAY: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

function hoursText(ranges: AvailabilityRule[]): string {
  return [...ranges]
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((r) => `${formatTimeLabel(r.startTime)} - ${formatTimeLabel(r.endTime)}`)
    .join(', ');
}

/** Each available day with its hours, in week order, for the event editor. */
export function availabilityByDay(rules: AvailabilityRule[]): { day: string; hours: string }[] {
  return WEEK_ORDER.filter((d) => rules.some((r) => r.weekday === d)).map((d) => ({
    day: SHORT_DAY[d] ?? '',
    hours: hoursText(rules.filter((r) => r.weekday === d)),
  }));
}

/**
 * One line for event cards, e.g. "Weekdays, 9:00am - 5:00pm" or
 * "Mon, Wed, Fri, hours vary". Mirrors what is saved on the Availability tab.
 */
export function summarizeAvailability(rules: AvailabilityRule[]): string {
  const days = availabilityByDay(rules);
  if (days.length === 0) return 'No available hours set';

  const names = days.map((d) => d.day);
  const dayText =
    names.length === 7
      ? 'Every day'
      : names.join(',') === 'Mon,Tue,Wed,Thu,Fri'
        ? 'Weekdays'
        : names.join(', ');

  const sameHours = days.every((d) => d.hours === days[0]?.hours);
  return `${dayText}, ${sameHours ? days[0]?.hours : 'hours vary'}`;
}
