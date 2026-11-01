import { prisma } from '../../infra/prisma.js';

export class IntegrationRepository {
  findGoogleByUser(userId: string) {
    return prisma.googleCalendarConnection.findUnique({ where: { userId } });
  }

  /** One connection per host: reconnecting replaces the stored account and token. */
  upsertGoogle(userId: string, googleEmail: string, sealedRefreshToken: string) {
    return prisma.googleCalendarConnection.upsert({
      where: { userId },
      create: { userId, googleEmail, refreshToken: sealedRefreshToken },
      update: { googleEmail, refreshToken: sealedRefreshToken },
    });
  }

  deleteGoogle(userId: string) {
    return prisma.googleCalendarConnection.deleteMany({ where: { userId } });
  }
}

export const integrationRepository = new IntegrationRepository();
