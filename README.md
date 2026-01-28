# Team Pulse

An async standup and check-in tool for remote teams that replaces synchronous meetings with lightweight, asynchronous workflows.

## Features

- ✅ **Async Check-ins**: Submit daily check-ins at your own pace
- ✅ **Team Management**: Create teams, invite members, manage roles
- ✅ **Analytics Dashboard**: Track participation, mood, energy, and blockers
- ✅ **Timezone-aware**: One check-in per day based on user's timezone
- ✅ **Draft Auto-save**: Automatically save check-in drafts
- ✅ **Image Attachments**: Upload images with check-ins (max 3 per check-in)
- ✅ **Notifications**: Configurable reminders and digests
- ✅ **Mobile Responsive**: Works great on all devices

## Tech Stack

### Frontend
- **Nuxt 3** - Vue.js framework with SSR
- **Pinia** - State management
- **Supabase** - Authentication
- **Tailwind CSS** - Styling

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM
- **PostgreSQL** - Database (via Supabase)
- **Supabase** - Auth, Storage, Database
- **Resend** - Email delivery

### Monorepo
- **pnpm** - Package manager
- **Turbo** - Build system

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase account and project
- Resend account (for emails)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd team-pulse
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy:
   - Project URL
   - Anon key
   - Service role key
3. Go to Storage and create two buckets:
   - `avatars` (public)
   - `attachments` (private)

### 4. Environment Variables

Copy `.env.example` to `.env` in the root directory and fill in your values:

```bash
cp .env.example .env
```

Update the following variables:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database (from Supabase project settings)
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

# Resend
RESEND_API_KEY=re_xxxxx

# App
NUXT_PUBLIC_API_URL=http://localhost:3001
API_PORT=3001
```

### 5. Database Migrations

Run Prisma migrations to set up the database schema:

```bash
pnpm db:migrate
```

### 6. Seed Database (Optional)

Populate the database with demo data:

```bash
pnpm db:seed
```

This creates:
- 2 demo teams
- 5 users (1 admin per team, 3 shared members)
- 30 days of check-ins with varied data

### 7. Start Development Servers

Start both frontend and backend:

```bash
pnpm dev
```

Or start them separately:

```bash
# Backend only
pnpm dev:api

# Frontend only
pnpm dev:web
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api

## Project Structure

```
team-pulse/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── users/     # User management
│   │   │   ├── teams/     # Team CRUD
│   │   │   ├── check-ins/ # Check-in submission
│   │   │   ├── analytics/ # Analytics endpoints
│   │   │   └── notifications/ # Notifications
│   │   └── prisma/        # Prisma schema and migrations
│   └── web/              # Nuxt 3 frontend
│       ├── pages/        # Route pages
│       ├── components/   # Vue components
│       ├── composables/  # Composable functions
│       └── stores/       # Pinia stores
├── packages/
│   └── shared/           # Shared TypeScript types and schemas
└── README.md
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all services in development
pnpm dev

# Start only backend
pnpm dev:api

# Start only frontend
pnpm dev:web

# Build all packages
pnpm build

# Run linter
pnpm lint

# Run tests
pnpm test

# Database commands
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
pnpm db:studio     # Open Prisma Studio
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `POST /users/me/avatar` - Upload avatar

### Teams
- `POST /teams` - Create team
- `GET /teams` - List user's teams
- `GET /teams/:id` - Get team details
- `PATCH /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `POST /teams/:id/regenerate-invite` - Regenerate invite code
- `GET /teams/join/:code` - Get team by invite code
- `POST /teams/join/:code` - Join team
- `GET /teams/:id/members` - Get team members
- `DELETE /teams/:id/members/:userId` - Remove member
- `PATCH /teams/:id/transfer-admin` - Transfer admin role

### Check-ins
- `POST /teams/:id/check-ins` - Submit check-in
- `GET /teams/:id/check-ins` - List check-ins (with filters)
- `GET /teams/:id/check-ins/mine/today` - Get today's check-in
- `PATCH /teams/:id/check-ins/:checkInId` - Update check-in
- `POST /teams/:id/check-ins/:checkInId/attachments` - Upload attachment

### Analytics
- `GET /teams/:id/analytics/participation?days=7|30` - Participation stats
- `GET /teams/:id/analytics/mood?days=7|30` - Mood trends
- `GET /teams/:id/analytics/energy?days=7|30` - Energy trends
- `GET /teams/:id/analytics/blockers` - Blocker keywords
- `GET /teams/:id/analytics/streaks` - Streak leaderboard
- `GET /teams/:id/analytics/export` - Export CSV

### Notifications
- `GET /users/me/notifications` - List notifications
- `PATCH /users/me/notifications/:id/read` - Mark as read
- `GET /users/me/notification-preferences` - Get preferences
- `PATCH /users/me/notification-preferences` - Update preferences

Full API documentation available at `/api` when running the backend.

## Key Features Implementation

### Timezone-aware Check-ins
- Each user has a timezone setting
- Check-ins are stored with date-only (no time)
- One check-in per day per team (enforced by unique constraint)
- Can only edit check-ins from the current day (user's timezone)

### Draft Auto-save
- Frontend debounces input changes (2 seconds)
- Drafts stored in localStorage with timestamp
- Automatically restored on page reload
- Cleared after successful submission

### Image Upload
- Client-side compression using `browser-image-compression`
- Max 3 attachments per check-in
- Max 1MB per file
- Uploaded to Supabase Storage
- Signed URLs with 1-hour expiration

### Analytics
- Participation rate: percentage of members who checked in
- Mood/Energy averages: calculated per day, excluding days with no check-ins
- Streaks: consecutive days with check-ins
- Blocker keywords: extracted from blockers field, frequency counted

## Deployment

### Backend (Vercel)

1. Connect your repository to Vercel
2. Set root directory to `apps/api`
3. Configure build command: `pnpm build`
4. Set output directory: `dist`
5. Add all environment variables
6. Deploy

### Frontend (Vercel)

1. Create a new Vercel project
2. Set root directory to `apps/web`
3. Framework preset: Nuxt.js (auto-detected)
4. Add environment variables (especially `NUXT_PUBLIC_API_URL`)
5. Deploy

### Database

- Use Supabase connection pooling (PgBouncer) for serverless
- Run migrations manually: `pnpm db:migrate`
- Or use Supabase migrations in production

## Testing

### Backend Tests
```bash
cd apps/api
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm test:cov      # Coverage report
```

### Frontend Tests
```bash
cd apps/web
pnpm test          # Component tests
```

## Known Limitations

- Real-time updates not implemented (polling required)
- Email scheduling requires external cron job or serverless function
- Image compression happens client-side only
- Analytics charts use placeholder (Chart.js integration needed)

## Future Improvements

- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with more visualizations
- [ ] Team templates and check-in questions customization
- [ ] Integration with Slack, Discord, etc.
- [ ] Export to PDF
- [ ] Search functionality
- [ ] Mentions and comments on check-ins

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
