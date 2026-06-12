import type { Request, Response } from 'express';
import { getCurrentHost } from '../../shared/context/current-host.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { eventTypeService, EventTypeService } from './event-type.service.js';

/** Thin HTTP layer: resolves the host, delegates to the service, shapes output. */
export class EventTypeController {
  constructor(private readonly service: EventTypeService = eventTypeService) {}

  list = async (_req: Request, res: Response) => {
    const host = await getCurrentHost();
    const data = await this.service.list(host.id);
    return sendSuccess(res, data, 200, { total: data.length });
  };

  create = async (req: Request, res: Response) => {
    const host = await getCurrentHost();
    const data = await this.service.create(host.id, req.body);
    return sendSuccess(res, data, 201);
  };

  update = async (req: Request, res: Response) => {
    const host = await getCurrentHost();
    const data = await this.service.update(host.id, req.params.id as string, req.body);
    return sendSuccess(res, data, 200);
  };

  remove = async (req: Request, res: Response) => {
    const host = await getCurrentHost();
    await this.service.remove(host.id, req.params.id as string);
    return sendSuccess(res, { id: req.params.id }, 200);
  };
}

export const eventTypeController = new EventTypeController();
