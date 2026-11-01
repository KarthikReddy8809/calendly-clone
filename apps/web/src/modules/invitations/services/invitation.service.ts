import { ENDPOINTS, type SendInvitationsDto, type SendInvitationsResult } from '@calendly/shared';
import { api } from '@/lib/api-client';

export const invitationService = {
  send: (payload: SendInvitationsDto) =>
    api.post<SendInvitationsResult>(ENDPOINTS.invitations.send, payload),
};
