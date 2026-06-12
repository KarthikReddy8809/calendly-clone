import winston from 'winston';
import { env, isProduction } from './env.js';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} ${level}: ${stack ?? message}${metaString}`;
});

/**
 * Structured JSON logs in production for ingestion by log aggregators;
 * human-friendly colorized output in development.
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(errors({ stack: true }), timestamp()),
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(json())
        : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
    }),
  ],
});
