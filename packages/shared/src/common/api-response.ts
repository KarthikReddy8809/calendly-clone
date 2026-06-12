/**
 * Standardized API envelope shared between the server and the web client.
 * Every endpoint returns either an ApiSuccess<T> or an ApiError payload so the
 * frontend type-safe API layer can branch on `success` deterministically.
 */

export interface ApiMeta {
  /** Total record count for paginated collections. */
  total?: number;
  page?: number;
  pageSize?: number;
  /** ISO timestamp the response was generated. */
  timestamp: string;
  /** Correlation id propagated from the request, useful for tracing logs. */
  requestId?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  /** Per-field validation issues, present on 422 responses. */
  details?: ApiFieldError[];
}

export interface ApiError {
  success: false;
  error: ApiErrorBody;
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return response.success === false;
}
