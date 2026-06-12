import { Router } from 'express';
import { z } from 'zod';
import { cancelMeetingSchema, listMeetingsQuerySchema } from '@calendly/shared';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { meetingController } from './meeting.controller.js';

const idParamSchema = z.object({ id: z.string().min(1) });

export const meetingRoutes: Router = Router();

meetingRoutes.get(
  '/',
  validate(listMeetingsQuerySchema, 'query'),
  asyncHandler(meetingController.list),
);

meetingRoutes.put(
  '/:id/cancel',
  validate(idParamSchema, 'params'),
  validate(cancelMeetingSchema, 'body'),
  asyncHandler(meetingController.cancel),
);
