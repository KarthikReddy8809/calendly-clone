import { PrismaClient, LocationType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds a single host with two event types and a Mon–Fri 9–5 availability.
 * Idempotent: re-running upserts the host and resets their config.
 */
async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@calendly.clone' },
    update: {},
    create: {
      name: 'Demo Host',
      email: 'demo@calendly.clone',
      username: 'demo',
      timezone: 'America/New_York',
      avatarUrl: null,
    },
  });

  await prisma.eventType.upsert({
    where: { userId_slug: { userId: user.id, slug: '30min' } },
    update: {},
    create: {
      userId: user.id,
      title: '30 Minute Meeting',
      slug: '30min',
      description: 'A quick 30 minute sync.',
      durationMinutes: 30,
      color: '#0069ff',
      locationType: LocationType.google_meet,
      isActive: true,
    },
  });

  await prisma.eventType.upsert({
    where: { userId_slug: { userId: user.id, slug: '15min-intro' } },
    update: {},
    create: {
      userId: user.id,
      title: '15 Minute Intro Call',
      slug: '15min-intro',
      description: 'Short introduction call.',
      durationMinutes: 15,
      color: '#8247f5',
      locationType: LocationType.phone,
      isActive: true,
    },
  });

  // Reset weekday availability to Mon–Fri 09:00–17:00.
  await prisma.availabilityRule.deleteMany({ where: { userId: user.id } });
  await prisma.availabilityRule.createMany({
    data: [1, 2, 3, 4, 5].map((weekday) => ({
      userId: user.id,
      weekday,
      startTime: '09:00',
      endTime: '17:00',
    })),
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded host "${user.username}" (${user.id})`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
