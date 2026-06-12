import { Router } from 'express';
import { z } from 'zod';
import { createEventTypeSchema, updateEventTypeSchema } from '@calendly/shared';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { eventTypeController } from './event-type.controller.js';

const idParamSchema = z.object({ id: z.string().min(1) });

export const eventTypeRoutes: Router = Router();

eventTypeRoutes.get('/', asyncHandler(eventTypeController.list));

eventTypeRoutes.post(
  '/',
  validate(createEventTypeSchema, 'body'),
  asyncHandler(eventTypeController.create),
);

eventTypeRoutes.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateEventTypeSchema, 'body'),
  asyncHandler(eventTypeController.update),
);

eventTypeRoutes.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(eventTypeController.remove),
);
