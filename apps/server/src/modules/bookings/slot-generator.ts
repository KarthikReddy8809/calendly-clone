import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import type { BookingSlot } from '@calendly/shared';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export interface SimpleRule {
  weekday: number;
  startTime: string; // "HH:mm"
  endTime: string;
}

export interface BookedRange {
  startTime: Date;
  endTime: Date;
}

export interface GenerateSlotsInput {
  date: string; // YYYY-MM-DD
  hostTimezone: string;
  durationMinutes: number;
  rules: SimpleRule[];
  booked: BookedRange[];
  now?: Date;
}

/**
 * Generates bookable slots for a single calendar date.
 *
 * The date is interpreted in the host's timezone, candidate starts step by the
 * event duration across each matching weekday rule, and any slot that is in the
 * past or overlaps an existing confirmed meeting is dropped. Returned times are
 * UTC ISO strings; the client renders them in the invitee's timezone.
 */
export function generateSlots(input: GenerateSlotsInput): BookingSlot[] {
  const { date, hostTimezone, durationMinutes, rules, booked } = input;
  const now = input.now ?? new Date();

  const dayStart = dayjs.tz(date, 'YYYY-MM-DD', hostTimezone);
  if (!dayStart.isValid()) return [];

  const weekday = dayStart.day();
  const dayRules = rules.filter((rule) => rule.weekday === weekday);

  const slots: BookingSlot[] = [];

  for (const rule of dayRules) {
    const [sh, sm] = rule.startTime.split(':').map(Number);
    const [eh, em] = rule.endTime.split(':').map(Number);

    let cursor = dayStart.hour(sh ?? 0).minute(sm ?? 0).second(0).millisecond(0);
    const windowEnd = dayStart.hour(eh ?? 0).minute(em ?? 0).second(0).millisecond(0);

    while (cursor.add(durationMinutes, 'minute').isBefore(windowEnd.add(1, 'second'))) {
      const slotStart = cursor;
      const slotEnd = cursor.add(durationMinutes, 'minute');

      const inPast = slotStart.toDate().getTime() <= now.getTime();
      const overlaps = booked.some(
        (b) =>
          slotStart.toDate().getTime() < b.endTime.getTime() &&
          slotEnd.toDate().getTime() > b.startTime.getTime(),
      );

      if (!inPast && !overlaps) {
        slots.push({
          startTime: slotStart.utc().toISOString(),
          endTime: slotEnd.utc().toISOString(),
        });
      }

      cursor = cursor.add(durationMinutes, 'minute');
    }
  }

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
