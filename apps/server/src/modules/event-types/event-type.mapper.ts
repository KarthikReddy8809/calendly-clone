import type { EventType as PrismaEventType } from '@prisma/client';
import type { EventType } from '@calendly/shared';

/** Maps a Prisma EventType row to the wire DTO (Date -> ISO string). */
export function toEventTypeDto(row: PrismaEventType): EventType {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    slug: row.slug,
    description: row.description,
    durationMinutes: row.durationMinutes,
    color: row.color,
    locationType: row.locationType,
    locationValue: row.locationValue,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
