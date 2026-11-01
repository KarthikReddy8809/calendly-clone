import type { RequestHandler } from 'express';
import { ForbiddenError } from '../errors/app-error.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * The session cookie is SameSite=None in production, so a plain HTML form on
 * another site could otherwise post to the API with the host's cookie. Browsers
 * only send a custom header cross-site after a CORS preflight, which our CORS
 * allow-list rejects, so requiring it on writes blocks those forged requests.
 */
export const csrfGuard: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method) || req.get('x-requested-with') === 'XMLHttpRequest') {
    next();
    return;
  }
  next(new ForbiddenError('Missing X-Requested-With header'));
};
