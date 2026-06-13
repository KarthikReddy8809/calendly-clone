import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Singleton Prisma client. In development we cache the instance on globalThis
 * so hot-reloading (tsx watch) doesn't exhaust the connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!isProduction || process.env.VERCEL) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  const timeoutMs = 15_000;
  await Promise.race([
    prisma.$connect(),
    new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              'Database connection timed out. Check DATABASE_URL and add ?connection_limit=1&connect_timeout=15&sslaccept=accept_invalid_certs&allowPublicKeyRetrieval=true for Railway on Vercel.',
            ),
          ),
        timeoutMs,
      );
    }),
  ]);
  logger.info('Database connection established');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}
