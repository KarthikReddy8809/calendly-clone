import type { EventType as PrismaEventType, Meeting as PrismaMeeting } from '@prisma/client';
import type { Meeting } from '@calendly/shared';

type MeetingWithEventType = PrismaMeeting & { eventType?: PrismaEventType | null };

export function toMeetingDto(row: MeetingWithEventType): Meeting {
  return {
    id: row.id,
    eventTypeId: row.eventTypeId,
    hostId: row.hostId,
    inviteeName: row.inviteeName,
    inviteeEmail: row.inviteeEmail,
    inviteeNotes: row.inviteeNotes,
    inviteeTimezone: row.inviteeTimezone,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    status: row.status,
    cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
    cancellationReason: row.cancellationReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    eventType: row.eventType
      ? {
          id: row.eventType.id,
          title: row.eventType.title,
          color: row.eventType.color,
          durationMinutes: row.eventType.durationMinutes,
          locationType: row.eventType.locationType,
        }
      : undefined,
  };
}
