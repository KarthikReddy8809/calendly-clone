import type { Request, Response } from 'express';
import { getCurrentHost } from '../../shared/context/current-host.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { availabilityService, AvailabilityService } from './availability.service.js';

export class AvailabilityController {
  constructor(private readonly service: AvailabilityService = availabilityService) {}

  get = async (_req: Request, res: Response) => {
    const host = await getCurrentHost();
    const data = await this.service.get(host.id, host.timezone);
    return sendSuccess(res, data);
  };

  update = async (req: Request, res: Response) => {
    const host = await getCurrentHost();
    const data = await this.service.update(host.id, req.body);
    return sendSuccess(res, data);
  };
}

export const availabilityController = new AvailabilityController();
