import { ENDPOINTS, type LoginDto, type SignupDto, type User } from '@calendly/shared';
import { api, ApiRequestError } from '@/lib/api-client';

export const authService = {
  signup: (payload: SignupDto) => api.post<User>(ENDPOINTS.auth.signup, payload),
  login: (payload: LoginDto) => api.post<User>(ENDPOINTS.auth.login, payload),
  logout: () => api.post<{ loggedOut: boolean }>(ENDPOINTS.auth.logout),

  /** The logged-in host, or null when there is no valid session. */
  me: async (): Promise<User | null> => {
    try {
      return await api.get<User>(ENDPOINTS.auth.me);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) return null;
      throw error;
    }
  },
};
