import type { Request, Response } from 'express';
import { getCurrentHost } from '../../shared/context/current-host.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { meetingService, MeetingService } from './meeting.service.js';

export class MeetingController {
  constructor(private readonly service: MeetingService = meetingService) {}

  list = async (req: Request, res: Response) => {
    const host = await getCurrentHost();
    const result = await this.service.list(host.id, req.query as never);
    return sendSuccess(res, result.items, 200, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  };

  cancel = async (req: Request, res: Response) => {
    const host = await getCurrentHost();
    const data = await this.service.cancel(host.id, req.params.id as string, req.body);
    return sendSuccess(res, data);
  };
}

export const meetingController = new MeetingController();
