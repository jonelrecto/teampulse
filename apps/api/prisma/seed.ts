import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: 'user-1',
      email: 'alice@example.com',
      displayName: 'Alice Johnson',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: 'user-2',
      email: 'bob@example.com',
      displayName: 'Bob Smith',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      id: 'user-3',
      email: 'charlie@example.com',
      displayName: 'Charlie Brown',
    },
  });

  console.log('✅ Created users');

  // Create sample teams
  const team1 = await prisma.team.create({
    data: {
      name: 'Engineering Team',
      description: 'Our awesome engineering team',
      memberships: {
        create: [
          { userId: user1.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Product Team',
      description: 'Product development team',
      memberships: {
        create: [
          { userId: user1.id, role: 'MEMBER' },
          { userId: user2.id, role: 'ADMIN' },
        ],
      },
    },
  });

  console.log('✅ Created teams');

  // Create sample check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.checkIn.createMany({
    data: [
      {
        userId: user1.id,
        teamId: team1.id,
        today: 'Working on the new authentication system',
        yesterday: 'Completed user registration flow',
        blockers: 'Waiting for API documentation',
        mood: 'GOOD',
        createdAt: today,
      },
      {
        userId: user2.id,
        teamId: team1.id,
        today: 'Reviewing pull requests and fixing bugs',
        yesterday: 'Implemented new feature',
        mood: 'GREAT',
        createdAt: today,
      },
      {
        userId: user3.id,
        teamId: team1.id,
        today: 'Setting up CI/CD pipeline',
        yesterday: 'Configured deployment scripts',
        mood: 'OKAY',
        createdAt: today,
      },
    ],
  });

  console.log('✅ Created check-ins');

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'check_in_reminder',
      title: 'Daily Check-in Reminder',
      body: "Don't forget to submit your check-in for Engineering Team",
    },
  });

  console.log('✅ Created notifications');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
