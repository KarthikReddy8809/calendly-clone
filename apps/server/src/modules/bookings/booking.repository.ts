import type { Prisma } from '@prisma/client';
import { prisma } from '../../infra/prisma.js';

export class BookingRepository {
  /** Resolve an active, non-deleted event type by its public slug, with host. */
  findPublicEventType(slug: string) {
    return prisma.eventType.findFirst({
      where: { slug, isActive: true, deletedAt: null, user: { deletedAt: null } },
      include: { user: true },
    });
  }

  findHostRules(userId: string) {
    return prisma.availabilityRule.findMany({
      where: { userId },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    });
  }

  /** Confirmed meetings for a host overlapping a [from, to) window. */
  findConfirmedMeetings(hostId: string, from: Date, to: Date) {
    return prisma.meeting.findMany({
      where: {
        hostId,
        status: 'confirmed',
        startTime: { gte: from, lt: to },
      },
      select: { startTime: true, endTime: true },
    });
  }

  create(data: Prisma.MeetingUncheckedCreateInput) {
    return prisma.meeting.create({
      data,
      include: { eventType: true, host: true },
    });
  }
}

export const bookingRepository = new BookingRepository();
