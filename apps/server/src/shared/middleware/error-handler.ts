import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ERROR_CODES } from '@calendly/shared';
import { logger } from '../../config/logger.js';
import { isProduction } from '../../config/env.js';
import { sendError } from '../http/api-response.js';
import { AppError, DoubleBookingError } from '../errors/app-error.js';

/** Terminal 404 handler for unmatched routes. */
export const notFoundHandler: RequestHandler = (req, res) => {
  sendError(res, 404, ERROR_CODES.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`);
};

/**
 * Central error boundary. Normalizes operational errors, Prisma known errors,
 * and unexpected exceptions into the standard ApiError envelope.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Operational error flagged non-operational', { err });
    }
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Unique constraint violation -> treat as a double booking / conflict.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const conflict = new DoubleBookingError();
    sendError(res, conflict.statusCode, conflict.code, conflict.message);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    sendError(res, 404, ERROR_CODES.NOT_FOUND, 'Resource not found');
    return;
  }

  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
  });

  sendError(
    res,
    500,
    ERROR_CODES.INTERNAL_ERROR,
    isProduction ? 'Something went wrong' : `${err}`,
  );
};
