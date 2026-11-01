import { prisma } from '../../infra/prisma.js';

/** Mon to Fri, 09:00 to 17:00: what a new host can be booked for out of the box. */
const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5];

export interface CreateHostInput {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  passwordHash: string;
  timezone: string;
}

export class AuthRepository {
  findActiveByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  emailExists(email: string) {
    // Includes soft-deleted rows: the unique index still holds their email.
    return prisma.user.count({ where: { email } }).then((n) => n > 0);
  }

  usernameExists(username: string) {
    return prisma.user.count({ where: { username } }).then((n) => n > 0);
  }

  /** Creates the host and their default weekly availability in one transaction. */
  createHost(input: CreateHostInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstname: input.firstname,
          lastname: input.lastname,
          email: input.email,
          username: input.username,
          password: input.passwordHash,
          timezone: input.timezone,
        },
      });
      await tx.availabilityRule.createMany({
        data: DEFAULT_WEEKDAYS.map((weekday) => ({
          userId: user.id,
          weekday,
          startTime: '09:00',
          endTime: '17:00',
        })),
      });
      return user;
    });
  }
}

export const authRepository = new AuthRepository();
