# Database Connection Issue - ENOTFOUND Error

## Current Error
```
Error code: ENOTFOUND
Error message: getaddrinfo ENOTFOUND db.zohumijxqqcbtwywbwqc.supabase.co
```

This means the DNS cannot resolve the hostname. This is **not a code issue** - it's a Supabase configuration issue.

## What to Check

### 1. Verify Supabase Project Status

Go to your Supabase Dashboard:
- **https://supabase.com/dashboard**
- Check if your project `zohumijxqqcbtwywbwqc` is:
  - ✅ **Active** (not paused)
  - ✅ **Not deleted**
  - ✅ **Accessible**

### 2. Get Fresh Connection String

1. Go to **Supabase Dashboard** > Your Project
2. Navigate to **Settings** > **Database**
3. Scroll to **Connection string** section
4. Select **URI** format (not JDBC)
5. Copy the **Connection string** - it should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   
   OR for direct connection:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 3. Update Your .env File

Replace the connection strings in both:
- Root `.env` file
- `apps/api/.env` file (copy from root)

**Important:**
- Use the **exact** connection string from Supabase Dashboard
- Don't modify the hostname or ports
- The password might be different from what you have

### 4. Test Connection Again

After updating, test the connection:

```bash
cd apps/api
pnpm test:db
```

Or use the TypeScript version:
```bash
cd apps/api
pnpm test:connection
```

## Common Solutions

### Solution 1: Project is Paused
If your Supabase project is paused (free tier inactivity):
1. Go to Supabase Dashboard
2. Click "Restore" or "Resume" on your project
3. Wait for it to become active
4. Try connecting again

### Solution 2: Wrong Connection String Format
Supabase might have changed their connection string format. Always get it fresh from the dashboard.

### Solution 3: Network/Firewall Issues
- Check if you can access `https://zohumijxqqcbtwywbwqc.supabase.co` in your browser
- If not, there might be network/firewall restrictions
- Try from a different network

### Solution 4: Project Deleted or Renamed
- Verify the project still exists
- Check if the project reference ID is correct
- Create a new project if needed

## Quick Test Commands

```bash
# Test database connection (simple)
cd apps/api
pnpm test:db

# Test with Prisma
cd apps/api
pnpm test:connection

# Try migration after connection works
cd ../..
pnpm db:migrate
```

## Next Steps

1. ✅ Verify Supabase project is active
2. ✅ Get fresh connection string from dashboard
3. ✅ Update `.env` files
4. ✅ Test connection
5. ✅ Run migrations once connection works

## Still Having Issues?

If the connection still fails after checking everything above:

1. **Create a new Supabase project** (if the old one is gone)
2. **Use the new project's connection string**
3. **Update all `.env` files**
4. **Run migrations again**

The code is ready - you just need valid Supabase credentials! 🚀
