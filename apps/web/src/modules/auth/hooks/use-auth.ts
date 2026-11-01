import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginDto, SignupDto, User } from '@calendly/shared';
import { queryKeys } from '@/lib/query-keys';
import { authService } from '../services/auth.service';

/**
 * The session only changes through login, signup and logout, which all write
 * this cache entry directly, so it never needs a background refetch.
 */
export const currentUserQueryOptions = queryOptions({
  queryKey: queryKeys.auth.me,
  queryFn: authService.me,
  staleTime: Infinity,
});

/** The logged-in host. Inside the dashboard the route guard guarantees it is loaded. */
export function useCurrentUser() {
  return useQuery(currentUserQueryOptions);
}

function useSetSession() {
  const qc = useQueryClient();
  return (user: User) => {
    // Drop anything cached for a previous account before showing the new one.
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== queryKeys.auth.me[0] });
    qc.setQueryData(queryKeys.auth.me, user);
  };
}

export function useLogin() {
  const setSession = useSetSession();
  return useMutation({
    mutationFn: (payload: LoginDto) => authService.login(payload),
    onSuccess: setSession,
  });
}

export function useSignup() {
  const setSession = useSetSession();
  return useMutation({
    mutationFn: (payload: SignupDto) => authService.signup(payload),
    onSuccess: setSession,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      qc.clear();
      qc.setQueryData(queryKeys.auth.me, null);
    },
  });
}
