import { PrismaClient } from '@prisma/client';

// Check if DIRECT_URL is set
if (!process.env.DIRECT_URL) {
  console.error('❌ DIRECT_URL environment variable not found!');
  console.error('Make sure .env file exists in apps/api/ directory');
  process.exit(1);
}

console.log('Using DIRECT_URL:', process.env.DIRECT_URL.replace(/:[^:@]+@/, ':****@'));

// Create Prisma Client with explicit DIRECT_URL for testing
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Using DIRECT_URL from .env file');
    
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful!', result);
    
    await prisma.$disconnect();
    console.log('\n✅ Connection test passed! You can now run migrations.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Verify your Supabase project is active (not paused)');
    console.error('2. Check your database password in Supabase Dashboard > Settings > Database');
    console.error('3. Ensure DIRECT_URL uses port 5432 (not 6543)');
    console.error('4. Check if your IP is allowed (Supabase > Settings > Database > Connection Pooling)');
    console.error('5. Verify the .env file exists in apps/api/ directory');
    console.error('6. Try using the connection string from Supabase Dashboard directly');
    console.error('\nError details:', error.code || 'Unknown error');
    
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

testConnection();
