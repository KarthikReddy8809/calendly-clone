import { Router } from 'express';
import { z } from 'zod';
import { createBookingSchema, getSlotsQuerySchema } from '@calendly/shared';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { bookingController } from './booking.controller.js';

const slugParamSchema = z.object({ slug: z.string().min(1) });

export const bookingRoutes: Router = Router();

bookingRoutes.get(
  '/:slug',
  validate(slugParamSchema, 'params'),
  asyncHandler(bookingController.getEventType),
);

bookingRoutes.get(
  '/:slug/slots',
  validate(slugParamSchema, 'params'),
  validate(getSlotsQuerySchema, 'query'),
  asyncHandler(bookingController.getSlots),
);

bookingRoutes.post(
  '/:slug',
  validate(slugParamSchema, 'params'),
  validate(createBookingSchema, 'body'),
  asyncHandler(bookingController.create),
);
