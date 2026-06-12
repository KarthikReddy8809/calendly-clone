import type { Prisma } from '@prisma/client';
import { prisma } from '../../infra/prisma.js';

/**
 * Data-access layer for event types. The repository is the only place that
 * knows about Prisma; services depend on this interface, not on the ORM.
 */
export class EventTypeRepository {
  findManyByUser(userId: string) {
    return prisma.eventType.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string, userId: string) {
    return prisma.eventType.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  findBySlug(userId: string, slug: string) {
    return prisma.eventType.findFirst({
      where: { userId, slug, deletedAt: null },
    });
  }

  create(data: Prisma.EventTypeUncheckedCreateInput) {
    return prisma.eventType.create({ data });
  }

  // Ownership is enforced by the service via findById before mutating, so the
  // primary-key `where` here is safe and uses the unique index.
  update(id: string, data: Prisma.EventTypeUpdateInput) {
    return prisma.eventType.update({
      where: { id },
      data,
    });
  }

  /** Soft delete: stamp deletedAt so historic meetings keep a valid FK. */
  softDelete(id: string) {
    return prisma.eventType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

export const eventTypeRepository = new EventTypeRepository();
