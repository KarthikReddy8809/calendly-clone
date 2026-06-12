import type { User } from '@prisma/client';
import { prisma } from '../../infra/prisma.js';
import { NotFoundError } from '../errors/app-error.js';

/**
 * Auth is out of scope for this scaffold, so all authenticated routes operate
 * as the single seeded "demo" host. Swapping this for a real session/JWT
 * lookup later is the only change needed to make the app multi-tenant.
 */
export async function getCurrentHost(): Promise<User> {
  const host = await prisma.user.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });

  if (!host) {
    throw new NotFoundError('No host account found. Run `pnpm --filter @calendly/server db:seed`.');
  }

  return host;
}
