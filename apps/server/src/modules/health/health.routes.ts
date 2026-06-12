import { Router } from 'express';
import { prisma } from '../../infra/prisma.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { sendSuccess } from '../../shared/http/api-response.js';

export const healthRoutes: Router = Router();

/** Liveness + DB readiness probe. */
healthRoutes.get(
  '/',
  asyncHandler(async (_req, res) => {
    let database = 'up';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    return sendSuccess(res, {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      database,
    });
  }),
);
