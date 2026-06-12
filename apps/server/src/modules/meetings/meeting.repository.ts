import type { Prisma } from '@prisma/client';
import { prisma } from '../../infra/prisma.js';

export interface MeetingListFilter {
  hostId: string;
  where: Prisma.MeetingWhereInput;
  skip: number;
  take: number;
  orderBy: Prisma.MeetingOrderByWithRelationInput;
}

export class MeetingRepository {
  async findManyAndCount(filter: MeetingListFilter) {
    const where = { hostId: filter.hostId, ...filter.where };
    const [rows, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: { eventType: true },
        orderBy: filter.orderBy,
        skip: filter.skip,
        take: filter.take,
      }),
      prisma.meeting.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string, hostId: string) {
    return prisma.meeting.findFirst({
      where: { id, hostId },
      include: { eventType: true },
    });
  }

  cancel(id: string, reason: string | null) {
    return prisma.meeting.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        // Free the slot so the same time can be rebooked (unique key -> NULL).
        bookingSlotKey: null,
      },
      include: { eventType: true },
    });
  }
}

export const meetingRepository = new MeetingRepository();
