import { useMutation } from '@tanstack/react-query';
import type { SendInvitationsDto } from '@calendly/shared';
import { invitationService } from '../services/invitation.service';

export function useSendInvitations() {
  return useMutation({
    mutationFn: (payload: SendInvitationsDto) => invitationService.send(payload),
  });
}
