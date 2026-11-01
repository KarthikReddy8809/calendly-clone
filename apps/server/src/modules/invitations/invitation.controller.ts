import type { Request, Response } from 'express';
import { getCurrentHost } from '../../shared/context/current-host.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { invitationService, InvitationService } from './invitation.service.js';

export class InvitationController {
  constructor(private readonly service: InvitationService = invitationService) {}

  send = async (req: Request, res: Response) => {
    const data = await this.service.send(getCurrentHost(res), req.body);
    return sendSuccess(res, data);
  };
}

export const invitationController = new InvitationController();
