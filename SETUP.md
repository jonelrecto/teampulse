# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm 8+ installed (`npm install -g pnpm`)
- [ ] Supabase account created
- [ ] Resend account created (for emails)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (takes ~2 minutes)
3. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key
4. Go to **Storage** and create two buckets:
   - `avatars` (make it public)
   - `attachments` (keep it private)
5. Go to **Database** and copy the connection string:
   - Use the connection pooling URL for `DATABASE_URL`
   - Use the direct connection URL for `DIRECT_URL`

### 3. Set Up Resend

1. Go to [resend.com](https://resend.com) and sign up
2. Create an API key
3. Copy the API key

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example
cp .env.example .env
```

Fill in all the values from Supabase and Resend.

### 5. Run Database Migrations

```bash
pnpm db:migrate
```

This will:
- Generate Prisma client
- Create all database tables
- Set up indexes and constraints

### 6. (Optional) Seed Demo Data

```bash
pnpm db:seed
```

This creates:
- 2 demo teams
- 5 users
- 30 days of check-ins

### 7. Start Development Servers

```bash
pnpm dev
```

This starts:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

### 8. Test the Application

1. Open http://localhost:3000
2. Click "Get Started" to register
3. Create a team
4. Submit a check-in

## Troubleshooting

### Database Connection Issues

- Make sure you're using the correct connection strings
- Check that your Supabase project is active
- Verify the database password is correct

### Authentication Issues

- Ensure Supabase Auth is enabled in your project
- Check that email auth is enabled in Supabase settings
- Verify your Supabase keys are correct

### Build Errors

- Make sure all dependencies are installed: `pnpm install`
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Check Node.js version: `node --version` (should be 18+)

### Port Already in Use

If port 3000 or 3001 is already in use:
- Change `API_PORT` in `.env` for backend
- Change Nuxt port: `pnpm dev:web --port 3002`

## Next Steps

- Read the main [README.md](./README.md) for detailed documentation
- Check API docs at http://localhost:3001/api
- Explore the codebase structure
- Customize email templates in `apps/api/src/emails/templates/`

## Getting Help

- Check the main README for detailed information
- Review error messages in the console
- Check Supabase dashboard for database issues
- Verify environment variables are set correctly
