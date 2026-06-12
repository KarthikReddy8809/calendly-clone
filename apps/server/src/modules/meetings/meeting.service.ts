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
    return toMeetingDto(row);
  }

  private buildScopeFilter(
    scope: ListMeetingsQuery['scope'],
    now: Date,
  ): Prisma.MeetingWhereInput {
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
