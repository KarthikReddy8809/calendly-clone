import { Router } from 'express';
import { loginSchema, signupSchema } from '@calendly/shared';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/require-auth.js';
import { authController } from './auth.controller.js';

export const authRoutes: Router = Router();

authRoutes.post('/signup', validate(signupSchema, 'body'), asyncHandler(authController.signup));
authRoutes.post('/login', validate(loginSchema, 'body'), asyncHandler(authController.login));
authRoutes.post('/logout', asyncHandler(authController.logout));
authRoutes.get('/me', requireAuth, asyncHandler(authController.me));
