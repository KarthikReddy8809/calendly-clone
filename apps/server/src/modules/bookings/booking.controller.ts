import type { Request, Response } from 'express';
import { sendSuccess } from '../../shared/http/api-response.js';
import { bookingService, BookingService } from './booking.service.js';

export class BookingController {
  constructor(private readonly service: BookingService = bookingService) {}

  getEventType = async (req: Request, res: Response) => {
    const data = await this.service.getPublicEventType(req.params.slug as string);
    return sendSuccess(res, data);
  };

  getSlots = async (req: Request, res: Response) => {
    const data = await this.service.getSlots(req.params.slug as string, req.query as never);
    return sendSuccess(res, data);
  };

  create = async (req: Request, res: Response) => {
    const data = await this.service.createBooking(req.params.slug as string, req.body);
    return sendSuccess(res, data, 201);
  };
}

export const bookingController = new BookingController();
