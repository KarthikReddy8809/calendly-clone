import { Router } from 'express';
import { z } from 'zod';
import { createBookingSchema, getSlotsQuerySchema } from '@calendly/shared';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { bookingController } from './booking.controller.js';

const linkParamSchema = z.object({ username: z.string().min(1), slug: z.string().min(1) });

export const bookingRoutes: Router = Router();

bookingRoutes.get(
  '/:username/:slug',
  validate(linkParamSchema, 'params'),
  asyncHandler(bookingController.getEventType),
);

bookingRoutes.get(
  '/:username/:slug/slots',
  validate(linkParamSchema, 'params'),
  validate(getSlotsQuerySchema, 'query'),
  asyncHandler(bookingController.getSlots),
);

bookingRoutes.post(
  '/:username/:slug',
  validate(linkParamSchema, 'params'),
  validate(createBookingSchema, 'body'),
  asyncHandler(bookingController.create),
);
