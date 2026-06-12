import { z } from 'zod';
import { paginationQuerySchema } from '../../common/pagination.js';

export const MEETING_STATUSES = ['confirmed', 'cancelled'] as const;
export const meetingStatusSchema = z.enum(MEETING_STATUSES);
export type MeetingStatus = z.infer<typeof meetingStatusSchema>;

/** Lightweight embedded event-type summary returned alongside a meeting. */
export const meetingEventTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
  color: z.string(),
  durationMinutes: z.number().int(),
  locationType: z.string(),
});

export const meetingSchema = z.object({
  id: z.string(),
  eventTypeId: z.string(),
  hostId: z.string(),
  inviteeName: z.string(),
  inviteeEmail: z.string().email(),
  inviteeNotes: z.string().nullable(),
  inviteeTimezone: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: meetingStatusSchema,
  cancelledAt: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  eventType: meetingEventTypeSchema.optional(),
});

export type Meeting = z.infer<typeof meetingSchema>;

/* ------------------------------- DTOs ------------------------------- */

export const MEETING_SCOPES = ['upcoming', 'past', 'cancelled'] as const;

export const listMeetingsQuerySchema = paginationQuerySchema.extend({
  scope: z.enum(MEETING_SCOPES).default('upcoming'),
});

export type ListMeetingsQuery = z.input<typeof listMeetingsQuerySchema>;

export const cancelMeetingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CancelMeetingDto = z.input<typeof cancelMeetingSchema>;

export type MeetingResponse = Meeting;
export type MeetingListResponse = Meeting[];
