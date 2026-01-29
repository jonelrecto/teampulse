const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...\n');
  
  // Test DIRECT_URL (for migrations)
  console.log('Testing DIRECT_URL (port 5432)...');
  const directUrl = process.env.DIRECT_URL;
  
  if (!directUrl) {
    console.error('❌ DIRECT_URL not found in .env file');
    return;
  }
  
  console.log('Connection string format:', directUrl.replace(/:[^:@]+@/, ':****@'));
  
  const client = new Client({
    connectionString: directUrl,
    connectionTimeoutMillis: 10000, // 10 second timeout
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('Running test query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Query successful!');
    console.log('PostgreSQL version:', result.rows[0].version.split(',')[0]);
    
    // Check if we can see tables
    console.log('\nChecking for existing tables...');
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Found tables:');
      tables.rows.forEach(row => console.log('  -', row.tablename));
    } else {
      console.log('ℹ️  No tables found (database is empty)');
    }
    
    await client.end();
    console.log('\n✅ All tests passed! Database is accessible.');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Check if Supabase project is active (not paused)');
      console.error('2. Verify the hostname is correct');
      console.error('3. Check if your IP is allowed in Supabase settings');
    } else if (error.code === '28P01') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Wrong password - check Supabase Dashboard > Settings > Database');
      console.error('2. Make sure password is URL-encoded if it has special characters');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. DNS cannot resolve hostname');
      console.error('2. Check the project URL is correct');
      console.error('3. Verify project exists and is active');
    }
    
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
  }
}

testConnection();