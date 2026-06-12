import type { RequestHandler } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../errors/app-error.js';

type RequestPart = 'body' | 'query' | 'params';

function toFieldErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

/**
 * Validation middleware factory. Parses a request part against a Zod schema and
 * replaces it with the typed/coerced result so controllers receive clean data.
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      next(new ValidationError('Validation failed', toFieldErrors(result.error)));
      return;
    }
    // query/params are read-only getters in Express 5 but writable here (v4).
    Object.assign(req, { [part]: result.data });
    next();
  };
}
