import type { RequestHandler } from 'express';
import { prisma } from '../../infra/prisma.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { readSessionUserId, SESSION_COOKIE } from '../auth/session.js';
import { asyncHandler } from '../http/async-handler.js';

/**
 * Resolves the logged-in host from the session cookie and stores it on
 * `res.locals.host`. Controllers read it through `getCurrentHost(res)`.
 * A deleted account or a stale token is treated as logged out.
 */
export const requireAuth: RequestHandler = asyncHandler(async (req, res, next) => {
  const userId = readSessionUserId(req.cookies?.[SESSION_COOKIE]);
  if (!userId) throw new UnauthorizedError();

  const host = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
  if (!host) throw new UnauthorizedError();

  res.locals.host = host;
  next();
});
