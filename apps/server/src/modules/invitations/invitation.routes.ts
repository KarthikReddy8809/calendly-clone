import { Router } from 'express';
import { sendInvitationsSchema } from '@calendly/shared';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { invitationController } from './invitation.controller.js';

export const invitationRoutes: Router = Router();

invitationRoutes.post(
  '/',
  validate(sendInvitationsSchema, 'body'),
  asyncHandler(invitationController.send),
);
