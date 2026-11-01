import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/require-auth.js';
import { integrationController } from './integration.controller.js';

const callbackQuerySchema = z.object({
  code: z.string().max(2048).optional(),
  state: z.string().max(2048).optional(),
  error: z.string().max(200).optional(),
});

export const integrationRoutes: Router = Router();

integrationRoutes.get('/google', requireAuth, asyncHandler(integrationController.googleStatus));
integrationRoutes.post(
  '/google/connect',
  requireAuth,
  asyncHandler(integrationController.googleConnect),
);
integrationRoutes.delete(
  '/google',
  requireAuth,
  asyncHandler(integrationController.googleDisconnect),
);

// Reached by a browser redirect from Google, so it cannot use requireAuth's
// 401. The signed `state` plus the session check in the service protect it.
integrationRoutes.get(
  '/google/callback',
  validate(callbackQuerySchema, 'query'),
  asyncHandler(integrationController.googleCallback),
);
