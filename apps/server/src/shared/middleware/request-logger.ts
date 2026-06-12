import type { RequestHandler } from 'express';
import { logger } from '../../config/logger.js';

/** Logs each request's method, path, status, and latency on completion. */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.http?.('request', {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(1)),
    });
  });

  next();
};
