import { Router } from 'express';
import { updateAvailabilitySchema } from '@calendly/shared';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { availabilityController } from './availability.controller.js';

export const availabilityRoutes: Router = Router();

availabilityRoutes.get('/', asyncHandler(availabilityController.get));

availabilityRoutes.put(
  '/',
  validate(updateAvailabilitySchema, 'body'),
  asyncHandler(availabilityController.update),
);
