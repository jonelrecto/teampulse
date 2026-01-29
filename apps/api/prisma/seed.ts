import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

 const alice = await prisma.users.upsert({
  where: { email: 'alice@example.com' },
  update: {},
  create: {
    id: 'some-uuid', // or use a UUID generator
    email: 'alice@example.com',
    displayName: 'Alice',
    supabaseId: 'supabase-user-id',
    updatedAt: new Date(),
  },
});

  // Create sample users
  const user1 = await prisma.users.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: 'user-1',
      email: 'alice@example.com',
      displayName: 'Alice Johnson',
      supabaseId: 'supabase-user-id2',
    updatedAt: new Date(),
    },
  });

  const user2 = await prisma.users.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: 'user-2',
      email: 'bob@example.com',
      displayName: 'Bob Smith',
      supabaseId: 'supabase-user-id3',
    updatedAt: new Date(),
    },
  });

  const user3 = await prisma.users.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      id: 'user-3',
      email: 'charlie@example.com',
      displayName: 'Charlie Brown',
      supabaseId: 'supabase-user-id4',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created users');

  // Create sample teams
  const team1 = await prisma.team.upsert({
    where: { id: 'team-1' }, // or use inviteCode: 'ENG-TEAM-001'
    update: {}, // Leave empty if you don't want to update existing data
    create: {
      id: 'team-1',
      name: 'Engineering Team',
      inviteCode: 'ENG-TEAM-001',
      updatedAt: new Date(),
      TeamMembership: {
        create: [
          { 
            id: 'membership-1',
            userId: user1.id, 
            role: 'ADMIN' 
          },
          { 
            id: 'membership-2',
            userId: user2.id, 
            role: 'MEMBER' 
          },
          { 
            id: 'membership-3',
            userId: user3.id, 
            role: 'MEMBER' 
          },
        ],
      },
    },
  });

  const team2= await prisma.team.upsert({
    where: { id: 'team-2' }, 
    update: {},
    create: {
      id: 'team-2',
      name: 'Engineering Team',
      inviteCode: 'ENG-TEAM-002',
      updatedAt: new Date(),
      TeamMembership: {
        create: [
          { 
            id: 'membership-12',
            userId: user1.id, 
            role: 'ADMIN' 
          },
          { 
            id: 'membership-22',
            userId: user2.id, 
            role: 'MEMBER' 
          },
        ],
      },
    },
  });

  // const team3 = await prisma.team.upsert({
  //   where: { id: 'team-33' },
  //   update: {}, 
  //   create: {
  //     id: 'team-33',
  //     name: 'Production Team',
  //     inviteCode: 'PROD-TEAM-001',
  //     updatedAt: new Date(),
  //     TeamMembership: {
  //       create: [
  //         { 
  //           id: 'prod--32',
  //           userId: user1.id, 
  //           role: 'ADMIN' 
  //         },
  //         { 
  //           id: 'prod--32',
  //           userId: user2.id, 
  //           role: 'MEMBER' 
  //         },
  //       ],
  //     },
  //   },
  // });

  console.log('✅ Created teams');

  // Create sample check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Today's check-ins
  await prisma.checkIn.upsert({
    where: {
      userId_teamId_checkInDate: {
        userId: user1.id,
        teamId: team1.id,
        checkInDate: today,
      },
    },
    update: {},
    create: {
      id: 'checkin-1',
      userId: user1.id,
      teamId: team1.id,
      yesterday: 'Completed user registration flow and fixed authentication bugs',
      today: 'Working on the new authentication system and implementing OAuth',
      blockers: 'Waiting for API documentation from backend team',
      mood: 'GOOD',
      energy: 7,
      checkInDate: today,
      updatedAt: new Date(),
    },
  });


await prisma.checkIn.upsert({
  where: {
    userId_teamId_checkInDate: {
      userId: user2.id,
      teamId: team1.id,
      checkInDate: today,
    },
  },
  update: {},
  create: {
    id: 'checkin-2',
    userId: user2.id,
    teamId: team1.id,
    yesterday: 'Implemented new feature for the dashboard',
    today: 'Reviewing pull requests and fixing bugs in the payment module',
    blockers: null,
    mood: 'GREAT',
    energy: 9,
    checkInDate: today,
    updatedAt: new Date(),
  },
});

await prisma.checkIn.upsert({
  where: {
    userId_teamId_checkInDate: {
      userId: user3.id,
      teamId: team1.id,
      checkInDate: today,
    },
  },
  update: {},
  create: {
    id: 'checkin-3',
    userId: user3.id,
    teamId: team1.id,
    yesterday: 'Configured deployment scripts and tested staging environment',
    today: 'Setting up CI/CD pipeline and Docker configurations',
    blockers: 'Need access to production servers',
    mood: 'OKAY',
    energy: 6,
    checkInDate: today,
    updatedAt: new Date(),
  },
});

// Yesterday's check-ins
await prisma.checkIn.upsert({
  where: {
    userId_teamId_checkInDate: {
      userId: user1.id,
      teamId: team1.id,
      checkInDate: yesterday,
    },
  },
  update: {},
  create: {
    id: 'checkin-4',
    userId: user1.id,
    teamId: team1.id,
    yesterday: 'Code review and planning sprint tasks',
    today: 'Completed user registration flow and fixed authentication bugs',
    blockers: null,
    mood: 'GREAT',
    energy: 8,
    checkInDate: yesterday,
    updatedAt: new Date(),
  },
});

await prisma.checkIn.upsert({
  where: {
    userId_teamId_checkInDate: {
      userId: user2.id,
      teamId: team1.id,
      checkInDate: yesterday,
    },
  },
  update: {},
  create: {
    id: 'checkin-5',
    userId: user2.id,
    teamId: team1.id,
    yesterday: 'Research on new payment gateway integration',
    today: 'Implemented new feature for the dashboard',
    blockers: 'Dependency on external API upgrade',
    mood: 'GOOD',
    energy: 7,
    checkInDate: yesterday,
    updatedAt: new Date(),
  },
});

// Two days ago check-ins
await prisma.checkIn.upsert({
  where: {
    userId_teamId_checkInDate: {
      userId: user1.id,
      teamId: team1.id,
      checkInDate: twoDaysAgo,
    },
  },
  update: {},
  create: {
    id: 'checkin-6',
    userId: user1.id,
    teamId: team1.id,
    yesterday: 'Team meeting and sprint planning',
    today: 'Code review and planning sprint tasks',
    blockers: null,
    mood: 'OKAY',
    energy: 6,
    checkInDate: twoDaysAgo,
    updatedAt: new Date(),
  },
});

await prisma.checkIn.upsert({
  where: {
    userId_teamId_checkInDate: {
      userId: user3.id,
      teamId: team1.id,
      checkInDate: twoDaysAgo,
    },
  },
  update: {},
  create: {
    id: 'checkin-7',
    userId: user3.id,
    teamId: team1.id,
    yesterday: 'Server maintenance and backup verification',
    today: 'Configured deployment scripts and tested staging environment',
    blockers: 'Server downtime affected testing',
    mood: 'LOW',
    energy: 4,
    checkInDate: twoDaysAgo,
    updatedAt: new Date(),
  },
});


  console.log('✅ Created notifications');

  console.log('🎉 Seeding completed!');

  console.log(alice, 'alice');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
