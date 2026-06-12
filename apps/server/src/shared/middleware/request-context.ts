import type { RequestHandler } from 'express';
import { nanoid } from 'nanoid';

/** Attaches a correlation id to every request for traceable logs/responses. */
export const requestContext: RequestHandler = (req, res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || nanoid(12);
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
