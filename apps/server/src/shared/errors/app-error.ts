import { ERROR_CODES, type ErrorCode, type ApiFieldError } from '@calendly/shared';

/**
 * Base application error. Carries an HTTP status, a machine-readable code, and
 * optional field-level details. The global error handler serializes these into
 * the standard ApiError envelope.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ApiFieldError[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: ApiFieldError[],
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: ApiFieldError[]) {
    super(400, ERROR_CODES.BAD_REQUEST, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: ApiFieldError[]) {
    super(422, ERROR_CODES.VALIDATION_ERROR, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, ERROR_CODES.NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code: ErrorCode = ERROR_CODES.CONFLICT) {
    super(409, code, message);
  }
}

export class DoubleBookingError extends ConflictError {
  constructor(message = 'This time slot has just been booked. Please pick another.') {
    super(message, ERROR_CODES.DOUBLE_BOOKING);
  }
}
