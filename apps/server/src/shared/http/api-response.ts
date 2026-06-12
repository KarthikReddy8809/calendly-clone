import type { Response } from 'express';
import type { ApiMeta, ApiFieldError, ErrorCode } from '@calendly/shared';

function baseMeta(res: Response): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId as string | undefined,
  };
}

/** Send a standardized success envelope. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: Partial<ApiMeta>,
): Response {
  return res.status(status).json({
    success: true,
    data,
    meta: { ...baseMeta(res), ...meta },
  });
}

/** Send a standardized error envelope. */
export function sendError(
  res: Response,
  status: number,
  code: ErrorCode,
  message: string,
  details?: ApiFieldError[],
): Response {
  return res.status(status).json({
    success: false,
    error: { code, message, details },
    meta: baseMeta(res),
  });
}
