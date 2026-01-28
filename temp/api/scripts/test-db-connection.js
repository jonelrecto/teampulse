// Simple Node.js script to test database connection without Prisma
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const directUrl = envVars.DIRECT_URL;
if (!directUrl) {
  console.error('❌ DIRECT_URL not found in .env file');
  process.exit(1);
}

console.log('Testing database connection...');
console.log('Host:', directUrl.match(/@([^:]+):/)?.[1] || 'unknown');
console.log('Port:', directUrl.match(/:(\d+)\//)?.[1] || 'unknown');

const client = new Client({
  connectionString: directUrl,
  connectionTimeoutMillis: 5000,
});

client.connect()
  .then(() => {
    console.log('✅ Successfully connected to database!');
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('✅ Database query successful!');
    console.log('PostgreSQL version:', result.rows[0].version.split(',')[0]);
    return client.end();
  })
  .then(() => {
    console.log('\n✅ Connection test passed! You can now run migrations.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\nPossible issues:');
      console.error('1. Database server is not accessible');
      console.error('2. Wrong host or port');
      console.error('3. Firewall blocking the connection');
      console.error('4. Supabase project might be paused');
    } else if (error.code === '28P01') {
      console.error('\nAuthentication failed!');
      console.error('1. Check your database password');
      console.error('2. Verify password in Supabase Dashboard > Settings > Database');
      console.error('3. Make sure password doesn\'t have unencoded special characters');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\nDNS resolution failed!');
      console.error('1. Check the hostname in your connection string');
      console.error('2. Verify your Supabase project URL');
    }
    
    console.error('\nTroubleshooting:');
    console.error('1. Go to Supabase Dashboard > Settings > Database');
    console.error('2. Copy the connection string directly from there');
    console.error('3. Make sure your project is Active (not paused)');
    console.error('4. Check Connection Pooling settings');
    
    process.exit(1);
  });
