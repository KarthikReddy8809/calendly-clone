import type { Prisma } from '@prisma/client';
import {
  cancelMeetingSchema,
  listMeetingsQuerySchema,
  type CancelMeetingDto,
  type ListMeetingsQuery,
  type Meeting,
} from '@calendly/shared';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error.js';
import { meetingRepository, MeetingRepository } from './meeting.repository.js';
import { toMeetingDto } from './meeting.mapper.js';
import { webAppUrl } from '../../config/env.js';
import { displayName } from '../../shared/context/current-host.js';
import { sendCancellationEmails } from '../../shared/email/email.service.js';
import { integrationService } from '../integrations/integration.service.js';

export interface PaginatedMeetings {
  items: Meeting[];
  total: number;
  page: number;
  pageSize: number;
}

export class MeetingService {
  constructor(private readonly repo: MeetingRepository = meetingRepository) {}

  async list(hostId: string, query: ListMeetingsQuery): Promise<PaginatedMeetings> {
    const { scope, page, pageSize } = listMeetingsQuerySchema.parse(query);
    const now = new Date();

    const where = this.buildScopeFilter(scope, now);
    const orderBy: Prisma.MeetingOrderByWithRelationInput = {
      startTime: scope === 'past' ? 'desc' : 'asc',
    };

    const { rows, total } = await this.repo.findManyAndCount({
      hostId,
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    });

    return { items: rows.map(toMeetingDto), total, page, pageSize };
  }

  async cancel(hostId: string, id: string, input: CancelMeetingDto): Promise<Meeting> {
    const dto = cancelMeetingSchema.parse(input);
    const existing = await this.repo.findById(id, hostId);
    if (!existing) throw new NotFoundError('Meeting not found');
    if (existing.status === 'cancelled') {
      throw new ConflictError('Meeting is already cancelled');
    }

    const row = await this.repo.cancel(id, dto.reason ?? null);

    // Never throws: removes the host's Google Calendar event, if one was made.
    if (row.googleEventId) {
      await integrationService.deleteMeetEvent(row.hostId, row.googleEventId);
    }

    // Never throws: a mail outage must not fail a cancellation that is saved.
    await sendCancellationEmails({
      hostName: displayName(row.host),
      hostEmail: row.host.email,
      hostTimezone: row.host.timezone,
      inviteeName: row.inviteeName,
      inviteeEmail: row.inviteeEmail,
      inviteeTimezone: row.inviteeTimezone,
      eventTitle: row.eventType.title,
      startTime: row.startTime,
      reason: row.cancellationReason,
      bookingPageUrl: `${webAppUrl}/book/${row.host.username}/${row.eventType.slug}`,
      meetingsUrl: `${webAppUrl}/meetings`,
    });

    return toMeetingDto(row);
  }

  private buildScopeFilter(scope: ListMeetingsQuery['scope'], now: Date): Prisma.MeetingWhereInput {
    switch (scope) {
      case 'past':
        return { status: 'confirmed', startTime: { lt: now } };
      case 'cancelled':
        return { status: 'cancelled' };
      case 'upcoming':
      default:
        return { status: 'confirmed', startTime: { gte: now } };
    }
  }
}

export const meetingService = new MeetingService();
