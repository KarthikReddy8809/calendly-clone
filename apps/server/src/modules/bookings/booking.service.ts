import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import {
  createBookingSchema,
  getSlotsQuerySchema,
  type BookingConfirmation,
  type BookingSlotsResponse,
  type CreateBookingDto,
  type GetSlotsQuery,
  type PublicEventType,
} from '@calendly/shared';
import { webAppUrl } from '../../config/env.js';
import { DoubleBookingError, NotFoundError } from '../../shared/errors/app-error.js';
import { sendBookingEmails } from '../../shared/email/email.service.js';
import { displayName } from '../../shared/context/current-host.js';
import { bookingRepository, BookingRepository } from './booking.repository.js';
import { integrationService, IntegrationService } from '../integrations/integration.service.js';
import { generateSlots } from './slot-generator.js';

dayjs.extend(utc);

/** A public booking link: /book/{username}/{slug}. */
export type BookingLink = { username: string; slug: string };

/** What the emails say under "Where". */
function describeLocation(meetUrl: string | null): string {
  return meetUrl ? 'Google Meet (link below)' : 'The host will send you the meeting details';
}

export class BookingService {
  constructor(
    private readonly repo: BookingRepository = bookingRepository,
    private readonly integrations: IntegrationService = integrationService,
  ) {}
  async getPublicEventType(link: BookingLink): Promise<PublicEventType> {
    const event = await this.repo.findPublicEventType(link.username, link.slug);
    if (!event) throw new NotFoundError('This scheduling link is no longer available');
    const rules = await this.repo.findHostRules(event.userId);

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      durationMinutes: event.durationMinutes,
      color: event.color,
      locationType: event.locationType,
      host: {
        name: displayName(event.user),
        username: event.user.username,
        timezone: event.user.timezone,
      },
      // Lets the booking calendar grey out days the host never works.
      availableWeekdays: [...new Set(rules.map((r) => r.weekday))].sort((a, b) => a - b),
    };
  }

  async getSlots(link: BookingLink, query: GetSlotsQuery): Promise<BookingSlotsResponse> {
    const { date, timezone } = getSlotsQuerySchema.parse(query);
    const event = await this.repo.findPublicEventType(link.username, link.slug);
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

  async createBooking(link: BookingLink, input: CreateBookingDto): Promise<BookingConfirmation> {
    const dto = createBookingSchema.parse(input);
    const event = await this.repo.findPublicEventType(link.username, link.slug);
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

    const hostName = displayName(event.user);

    // A unique Google Meet per booking, when the host has connected Google.
    // Runs after the slot is saved: a Google outage never loses a booking.
    const conference = await this.integrations.createMeetForBooking(event.userId, {
      requestId: meeting.id,
      summary: `${event.title}: ${meeting.inviteeName} and ${hostName}`,
      description: [
        `Booked by ${meeting.inviteeName} (${meeting.inviteeEmail}).`,
        ...(meeting.inviteeNotes ? ['', `Notes: ${meeting.inviteeNotes}`] : []),
      ].join('\n'),
      start: meeting.startTime,
      end: meeting.endTime,
      timeZone: event.user.timezone,
      attendee: { email: meeting.inviteeEmail, name: meeting.inviteeName },
    });
    const meetUrl = conference?.meetUrl ?? null;
    if (conference) {
      await this.repo.setConference(meeting.id, conference.eventId, conference.meetUrl);
    }

    // Never throws: a mail outage must not fail a booking that is already saved.
    await sendBookingEmails({
      host: {
        hostName,
        hostEmail: event.user.email,
        eventTitle: event.title,
        inviteeName: meeting.inviteeName,
        inviteeEmail: meeting.inviteeEmail,
        inviteeNotes: meeting.inviteeNotes,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        hostTimezone: event.user.timezone,
        inviteeTimezone: meeting.inviteeTimezone,
        meetUrl,
        meetingsUrl: `${webAppUrl}/meetings`,
      },
      invitee: {
        inviteeName: meeting.inviteeName,
        inviteeEmail: meeting.inviteeEmail,
        hostName,
        hostEmail: event.user.email,
        eventTitle: event.title,
        durationMinutes: event.durationMinutes,
        location: describeLocation(meetUrl),
        meetUrl,
        startTime: meeting.startTime,
        inviteeTimezone: meeting.inviteeTimezone,
        bookingPageUrl: `${webAppUrl}/book/${event.user.username}/${event.slug}`,
      },
    });

    return {
      id: meeting.id,
      startTime: meeting.startTime.toISOString(),
      endTime: meeting.endTime.toISOString(),
      inviteeName: meeting.inviteeName,
      inviteeEmail: meeting.inviteeEmail,
      inviteeTimezone: meeting.inviteeTimezone,
      eventTitle: event.title,
      hostName,
      locationType: event.locationType,
      meetUrl,
    };
  }
}

export const bookingService = new BookingService();
