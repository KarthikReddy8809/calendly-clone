import type { Request, Response } from 'express';
import { sendSuccess } from '../../shared/http/api-response.js';
import { bookingService, BookingService, type BookingLink } from './booking.service.js';

function linkParams(req: Request): BookingLink {
  return { username: req.params.username as string, slug: req.params.slug as string };
}

export class BookingController {
  constructor(private readonly service: BookingService = bookingService) {}

  getEventType = async (req: Request, res: Response) => {
    const data = await this.service.getPublicEventType(linkParams(req));
    return sendSuccess(res, data);
  };

  getSlots = async (req: Request, res: Response) => {
    const data = await this.service.getSlots(linkParams(req), req.query as never);
    return sendSuccess(res, data);
  };

  create = async (req: Request, res: Response) => {
    const data = await this.service.createBooking(linkParams(req), req.body);
    return sendSuccess(res, data, 201);
  };
}

export const bookingController = new BookingController();
