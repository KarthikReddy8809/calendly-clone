import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  createBookingSchema,
  getSlotsQuerySchema,
  type BookingConfirmation,
  type BookingSlotsResponse,
  type CreateBookingDto,
  type GetSlotsQuery,
  type PublicEventType,
} from '@calendly/shared';
import { logger } from '../../config/logger.js';
import { DoubleBookingError, NotFoundError } from '../../shared/errors/app-error.js';
import { sendBookingConfirmationEmail } from '../../shared/email/email.service.js';
import { bookingRepository, BookingRepository } from './booking.repository.js';
import { generateSlots } from './slot-generator.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export class BookingService {
  constructor(private readonly repo: BookingRepository = bookingRepository) {}
  async getPublicEventType(slug: string): Promise<PublicEventType> {
    const event = await this.repo.findPublicEventType(slug);
    if (!event) throw new NotFoundError('This scheduling link is no longer available');

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      durationMinutes: event.durationMinutes,
      color: event.color,
      locationType: event.locationType,
      host: {
        name: event.user.name,
        username: event.user.username,
        timezone: event.user.timezone,
        avatarUrl: event.user.avatarUrl,
      },
    };
  }

  async getSlots(slug: string, query: GetSlotsQuery): Promise<BookingSlotsResponse> {
    const { date, timezone } = getSlotsQuerySchema.parse(query);
    const event = await this.repo.findPublicEventType(slug);
    if (!event) throw new NotFoundError('This scheduling link is no longer available');

    const rules = await this.repo.findHostRules(event.userId);

    // Pull confirmed meetings for the surrounding window to filter overlaps.
    const windowStart = dayjs(date).subtract(1, 'day').toDate();
    const windowEnd = dayjs(date).add(2, 'day').toDate();
    const booked = await this.repo.findConfirmedMeetings(event.userId, windowStart, windowEnd);

    const slots = generateSlots({
      date,
      hostTimezone: event.user.timezone,
      durationMinutes: event.durationMinutes,
      rules: rules.map((r) => ({ weekday: r.weekday, startTime: r.startTime, endTime: r.endTime })),
      booked,
    });

    return { date, timezone, slots };
  }

  async createBooking(slug: string, input: CreateBookingDto): Promise<BookingConfirmation> {
    const dto = createBookingSchema.parse(input);
    const event = await this.repo.findPublicEventType(slug);
    if (!event) throw new NotFoundError('This scheduling link is no longer available');

    const start = dayjs(dto.startTime);
    const end = start.add(event.durationMinutes, 'minute');

    // DB unique index on bookingSlotKey is the source of truth; this string is
    // the guard that makes concurrent bookings of the same slot impossible.
    const bookingSlotKey = `${event.userId}:${start.utc().toISOString()}`;

    let meeting;
    try {
      meeting = await this.repo.create({
        eventTypeId: event.id,
        hostId: event.userId,
        inviteeName: dto.inviteeName,
        inviteeEmail: dto.inviteeEmail,
        inviteeNotes: dto.inviteeNotes ?? null,
        inviteeTimezone: dto.inviteeTimezone,
        startTime: start.toDate(),
        endTime: end.toDate(),
        status: 'confirmed',
        bookingSlotKey,
      });
    } catch (error) {
      // Prisma P2002 (unique violation) is normalized to a 409 by the global
      // handler, but we surface a friendlier domain error here too.
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new DoubleBookingError();
      }
      throw error;
    }

    try {
      await sendBookingConfirmationEmail({
        to: meeting.inviteeEmail,
        inviteeName: meeting.inviteeName,
        hostName: event.user.name,
        eventTitle: event.title,
        startTimeLabel: start.tz(dto.inviteeTimezone).format('MMM D, YYYY h:mm A z'),
        locationType: event.locationType,
      });
    } catch (error) {
      logger.warn('Failed to send booking confirmation email', {
        meetingId: meeting.id,
        inviteeEmail: meeting.inviteeEmail,
        error,
      });
    }

    return {
      id: meeting.id,
      startTime: meeting.startTime.toISOString(),
      endTime: meeting.endTime.toISOString(),
      inviteeName: meeting.inviteeName,
      inviteeEmail: meeting.inviteeEmail,
      inviteeTimezone: meeting.inviteeTimezone,
      eventTitle: event.title,
      hostName: event.user.name,
      locationType: event.locationType,
    };
  }
}

export const bookingService = new BookingService();
