import axios, { AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '@calendly/shared';
import { config } from './config';

/**
 * Shared Axios instance. All API traffic flows through this client.
 * `withCredentials` sends the httpOnly session cookie when the API is on
 * another origin; `X-Requested-With` satisfies the server's CSRF guard.
 */
export const httpClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  timeout: 15000,
  withCredentials: true,
});

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registers what happens when the session expires mid-use (any 401 outside
 * `/auth/*`). Registered by the router so this module stays router-agnostic.
 */
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
}

httpClient.interceptors.response.use(undefined, (error: unknown) => {
  if (
    error instanceof AxiosError &&
    error.response?.status === 401 &&
    !error.config?.url?.startsWith('/auth/')
  ) {
    unauthorizedHandler?.();
  }
  return Promise.reject(error);
});

/** Normalized error thrown by the typed API layer. */
export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function normalizeError(error: unknown): ApiRequestError {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiError | undefined;
    if (body && body.success === false) {
      return new ApiRequestError(
        body.error.code,
        body.error.message,
        error.response?.status,
        body.error.details,
      );
    }
    return new ApiRequestError('NETWORK_ERROR', error.message, error.response?.status);
  }
  return new ApiRequestError('UNKNOWN_ERROR', 'An unexpected error occurred');
}

/**
 * Unwraps the standard ApiResponse envelope, returning typed data on success
 * and throwing a normalized ApiRequestError otherwise. Generic helpers below
 * keep call sites concise and fully typed.
 */
async function request<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const { data } = await promise;
    if (data.success === false) {
      throw new ApiRequestError(data.error.code, data.error.message, undefined, data.error.details);
    }
    return data.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    throw normalizeError(error);
  }
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    request<T>(httpClient.get(url, { params })),
  post: <T>(url: string, body?: unknown) => request<T>(httpClient.post(url, body)),
  put: <T>(url: string, body?: unknown) => request<T>(httpClient.put(url, body)),
  delete: <T>(url: string) => request<T>(httpClient.delete(url)),
};
