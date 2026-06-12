import { prisma } from '../../infra/prisma.js';
import type { AvailabilityRule } from '@calendly/shared';

export class AvailabilityRepository {
  findRulesByUser(userId: string) {
    return prisma.availabilityRule.findMany({
      where: { userId },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Replaces a host's weekly availability atomically: timezone update + full
   * rule swap happen in one transaction to avoid partially-applied schedules.
   */
  replaceRules(userId: string, timezone: string, rules: AvailabilityRule[]) {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { timezone } });
      await tx.availabilityRule.deleteMany({ where: { userId } });
      if (rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: rules.map((rule) => ({
            userId,
            weekday: rule.weekday,
            startTime: rule.startTime,
            endTime: rule.endTime,
          })),
        });
      }
      return tx.availabilityRule.findMany({
        where: { userId },
        orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
      });
    });
  }
}

export const availabilityRepository = new AvailabilityRepository();
