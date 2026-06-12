import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { API_PREFIX } from '@calendly/shared';
import { env } from './config/env.js';
import { apiRouter } from './routes.js';
import { requestContext } from './shared/middleware/request-context.js';
import { requestLogger } from './shared/middleware/request-logger.js';
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler.js';

/**
 * Builds and configures the Express application. Kept free of side effects
 * (no `listen`) so it can be imported by tests and the server entrypoint alike.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(requestContext);
  app.use(requestLogger);

  app.use(API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
