import { PrismaClient, TeamRole, Mood, DigestFrequency } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin1@example.com' },
      update: {},
      create: {
        supabaseId: 'seed-admin-1',
        email: 'admin1@example.com',
        displayName: 'Alice Admin',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin2@example.com' },
      update: {},
      create: {
        supabaseId: 'seed-admin-2',
        email: 'admin2@example.com',
        displayName: 'Bob Admin',
        avatarUrl: 'https://i.pravatar.cc/150?img=2',
        timezone: 'America/Los_Angeles',
      },
    }),
    prisma.user.upsert({
      where: { email: 'member1@example.com' },
      update: {},
      create: {
        supabaseId: 'seed-member-1',
        email: 'member1@example.com',
        displayName: 'Charlie Member',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.upsert({
      where: { email: 'member2@example.com' },
      update: {},
      create: {
        supabaseId: 'seed-member-2',
        email: 'member2@example.com',
        displayName: 'Diana Member',
        avatarUrl: 'https://i.pravatar.cc/150?img=4',
        timezone: 'Europe/London',
      },
    }),
    prisma.user.upsert({
      where: { email: 'member3@example.com' },
      update: {},
      create: {
        supabaseId: 'seed-member-3',
        email: 'member3@example.com',
        displayName: 'Eve Member',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
        timezone: 'America/Chicago',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create teams
  const team1 = await prisma.team.upsert({
    where: { id: 'seed-team-1' },
    update: {},
    create: {
      id: 'seed-team-1',
      name: 'Engineering Team',
      logoUrl: 'https://via.placeholder.com/100',
    },
  });

  const team2 = await prisma.team.upsert({
    where: { id: 'seed-team-2' },
    update: {},
    create: {
      id: 'seed-team-2',
      name: 'Design Team',
      logoUrl: 'https://via.placeholder.com/100',
    },
  });

  console.log('✅ Created 2 teams');

  // Create memberships
  await Promise.all([
    // Team 1 memberships
    prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: users[0].id,
          teamId: team1.id,
        },
      },
      update: {},
      create: {
        userId: users[0].id,
        teamId: team1.id,
        role: TeamRole.ADMIN,
      },
    }),
    prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: users[2].id,
          teamId: team1.id,
        },
      },
      update: {},
      create: {
        userId: users[2].id,
        teamId: team1.id,
        role: TeamRole.MEMBER,
      },
    }),
    prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: users[3].id,
          teamId: team1.id,
        },
      },
      update: {},
      create: {
        userId: users[3].id,
        teamId: team1.id,
        role: TeamRole.MEMBER,
      },
    }),
    // Team 2 memberships
    prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: users[1].id,
          teamId: team2.id,
        },
      },
      update: {},
      create: {
        userId: users[1].id,
        teamId: team2.id,
        role: TeamRole.ADMIN,
      },
    }),
    prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: users[4].id,
          teamId: team2.id,
        },
      },
      update: {},
      create: {
        userId: users[4].id,
        teamId: team2.id,
        role: TeamRole.MEMBER,
      },
    }),
    // Shared member
    prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: users[2].id,
          teamId: team2.id,
        },
      },
      update: {},
      create: {
        userId: users[2].id,
        teamId: team2.id,
        role: TeamRole.MEMBER,
      },
    }),
  ]);

  console.log('✅ Created team memberships');

  // Create check-ins for the last 30 days
  const moods: Mood[] = [Mood.GREAT, Mood.GOOD, Mood.OKAY, Mood.LOW, Mood.STRUGGLING];
  const checkIns = [];

  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    // Create check-ins for team 1 members
    for (const user of [users[0], users[2], users[3]]) {
      // Skip some days randomly (70% participation rate)
      if (Math.random() > 0.3) {
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const energy = Math.floor(Math.random() * 5) + 1;
        const hasBlockers = Math.random() > 0.6;

        checkIns.push({
          userId: user.id,
          teamId: team1.id,
          yesterday: `Yesterday I worked on ${['features', 'bugs', 'refactoring', 'documentation'][Math.floor(Math.random() * 4)]}.`,
          today: `Today I plan to work on ${['new features', 'testing', 'code review', 'planning'][Math.floor(Math.random() * 4)]}.`,
          blockers: hasBlockers ? `Blocked on ${['API integration', 'design approval', 'dependency', 'clarification'][Math.floor(Math.random() * 4)]}.` : null,
          mood,
          energy,
          checkInDate: date,
        });
      }
    }

    // Create check-ins for team 2 members
    for (const user of [users[1], users[4], users[2]]) {
      if (Math.random() > 0.3) {
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const energy = Math.floor(Math.random() * 5) + 1;
        const hasBlockers = Math.random() > 0.6;

        checkIns.push({
          userId: user.id,
          teamId: team2.id,
          yesterday: `Yesterday I worked on ${['designs', 'prototypes', 'user research', 'wireframes'][Math.floor(Math.random() * 4)]}.`,
          today: `Today I plan to work on ${['new designs', 'user testing', 'feedback', 'iterations'][Math.floor(Math.random() * 4)]}.`,
          blockers: hasBlockers ? `Blocked on ${['stakeholder feedback', 'asset approval', 'tool access', 'requirements'][Math.floor(Math.random() * 4)]}.` : null,
          mood,
          energy,
          checkInDate: date,
        });
      }
    }
  }

  // Insert check-ins in batches
  for (const checkIn of checkIns) {
    await prisma.checkIn.upsert({
      where: {
        userId_teamId_checkInDate: {
          userId: checkIn.userId,
          teamId: checkIn.teamId,
          checkInDate: checkIn.checkInDate,
        },
      },
      update: {},
      create: checkIn,
    });
  }

  console.log(`✅ Created ${checkIns.length} check-ins`);

  // Create notification preferences
  for (const user of users) {
    for (const team of [team1, team2]) {
      const membership = await prisma.teamMembership.findUnique({
        where: {
          userId_teamId: {
            userId: user.id,
            teamId: team.id,
          },
        },
      });

      if (membership) {
        await prisma.notificationPreference.upsert({
          where: {
            userId_teamId: {
              userId: user.id,
              teamId: team.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            teamId: team.id,
            reminderEnabled: true,
            reminderTime: '09:00',
            digestFrequency: DigestFrequency.DAILY,
          },
        });
      }
    }
  }

  console.log('✅ Created notification preferences');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
