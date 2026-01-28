# Database Migration Troubleshooting

## Current Error
```
Error: P1001: Can't reach database server at `db.zohumijxqqcbtwywbwqc.supabase.co:5432`
```

## Steps to Fix

### 1. Verify Supabase Connection String

Go to your Supabase Dashboard:
1. Navigate to **Settings** > **Database**
2. Find the **Connection string** section
3. Copy the **URI** format (not the JDBC format)
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### 2. Update Your .env File

Make sure your `.env` file has the correct format:

```env
# For migrations (direct connection - port 5432)
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# For application (connection pooling - port 6543)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

**Important Notes:**
- Remove brackets `[]` from the password - they're just placeholders
- If your password contains special characters, URL encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `%` becomes `%25`
  - etc.

### 3. Check Database Access

1. Go to Supabase Dashboard > **Settings** > **Database**
2. Check **Connection Pooling** settings
3. Ensure your IP is not blocked
4. Verify the database is **Active** (not paused)

### 4. Test Connection

Run the test script:
```bash
cd apps/api
pnpm exec ts-node scripts/test-connection.ts
```

### 5. Alternative: Use Supabase SQL Editor

If migrations still fail, you can run the SQL manually:

1. Go to Supabase Dashboard > **SQL Editor**
2. Copy the SQL from the migration file in `apps/api/prisma/migrations/`
3. Run it directly in the SQL Editor

### 6. Common Issues

#### Issue: Password has special characters
**Solution:** URL encode special characters in the password

#### Issue: Database is paused
**Solution:** Go to Supabase Dashboard and resume/activate the project

#### Issue: IP not allowed
**Solution:** Check Supabase Dashboard > Settings > Database > Connection Pooling

#### Issue: Wrong port
**Solution:** 
- `DIRECT_URL` must use port **5432**
- `DATABASE_URL` must use port **6543** (with `?pgbouncer=true`)

### 7. Get Fresh Connection String

If nothing works, get a fresh connection string:

1. Go to Supabase Dashboard
2. Settings > Database
3. Click "Reset database password" (if needed)
4. Copy the new connection string
5. Update your `.env` file

## After Fixing

Once the connection works, run:
```bash
pnpm db:migrate
```

This will:
1. Create the migration files
2. Apply them to your database
3. Generate the Prisma Client
