import type { User } from '@prisma/client';
import {
  sendInvitationsSchema,
  ERROR_CODES,
  type SendInvitationsDto,
  type SendInvitationsResult,
} from '@calendly/shared';
import { webAppUrl } from '../../config/env.js';
import { AppError, BadRequestError, NotFoundError } from '../../shared/errors/app-error.js';
import { displayName } from '../../shared/context/current-host.js';
import { isEmailConfigured, sendInvitationEmails } from '../../shared/email/email.service.js';
import { eventTypeRepository, EventTypeRepository } from '../event-types/event-type.repository.js';

export class InvitationService {
  constructor(private readonly eventTypes: EventTypeRepository = eventTypeRepository) {}

  /** Emails the public link of one of the host's own event types to each address. */
  async send(host: User, input: SendInvitationsDto): Promise<SendInvitationsResult> {
    const dto = sendInvitationsSchema.parse(input);

    // Scoped to the host: another host's event type id answers 404, not 403.
    const eventType = await this.eventTypes.findById(dto.eventTypeId, host.id);
    if (!eventType) throw new NotFoundError('Event type not found');
    if (!eventType.isActive) {
      throw new BadRequestError('Turn this event type on before sharing its link');
    }

    if (!isEmailConfigured()) {
      throw new AppError(
        503,
        ERROR_CODES.EMAIL_UNAVAILABLE,
        'Email is not set up on the server. Copy the link and share it yourself instead.',
      );
    }

    const bookingUrl = `${webAppUrl}/book/${host.username}/${eventType.slug}`;
    const recipients = [...new Set(dto.emails)];

    const { sent, failed } = await sendInvitationEmails(recipients, {
      hostName: displayName(host),
      hostEmail: host.email,
      eventTitle: eventType.title,
      durationMinutes: eventType.durationMinutes,
      message: dto.message ? dto.message : null,
      bookingUrl,
    });

    return { bookingUrl, sent, failed };
  }
}

export const invitationService = new InvitationService();
