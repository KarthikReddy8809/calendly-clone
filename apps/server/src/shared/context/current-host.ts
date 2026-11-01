import type { Response } from 'express';
import type { User } from '@prisma/client';
import { UnauthorizedError } from '../errors/app-error.js';

/**
 * Returns the logged-in host that `requireAuth` attached to the response.
 * Throws 401 if a route forgot to mount `requireAuth`, rather than silently
 * acting as some other account.
 */
export function getCurrentHost(res: Response): User {
  const host = res.locals.host as User | undefined;
  if (!host) throw new UnauthorizedError();
  return host;
}

/** "Firstname Lastname", falling back to the email for older accounts. */
export function displayName(user: Pick<User, 'firstname' | 'lastname' | 'email'>): string {
  const name = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
  return name || user.email;
}
