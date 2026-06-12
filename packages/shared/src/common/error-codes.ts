/**
 * Canonical machine-readable error codes. The frontend maps these to
 * user-facing copy; never branch on human-readable messages.
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SLOT_UNAVAILABLE: 'SLOT_UNAVAILABLE',
  DOUBLE_BOOKING: 'DOUBLE_BOOKING',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
