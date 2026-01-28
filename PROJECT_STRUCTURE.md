# Project Structure Overview

## Monorepo Layout

```
team-pulse/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication module
│   │   │   │   ├── guards/     # JWT, Rate limit guards
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── users/          # User management
│   │   │   ├── teams/          # Team CRUD operations
│   │   │   │   ├── guards/     # Team member/admin guards
│   │   │   │   └── dto/        # Data transfer objects
│   │   │   ├── check-ins/      # Check-in submission
│   │   │   ├── analytics/      # Analytics endpoints
│   │   │   ├── notifications/  # Notification management
│   │   │   ├── emails/         # Email templates & service
│   │   │   ├── common/         # Shared utilities
│   │   │   │   ├── decorators/ # Custom decorators
│   │   │   │   ├── filters/    # Exception filters
│   │   │   │   └── middleware/ # Logging middleware
│   │   │   ├── prisma/         # Prisma service
│   │   │   ├── app.module.ts   # Root module
│   │   │   └── main.ts         # Application entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── seed.ts        # Seed script
│   │   └── package.json
│   │
│   └── web/                    # Nuxt 3 Frontend
│       ├── pages/              # Route pages
│       │   ├── index.vue       # Landing page
│       │   ├── login.vue
│       │   ├── register.vue
│       │   ├── dashboard.vue
│       │   └── teams/
│       │       ├── new.vue
│       │       └── [teamId]/
│       │           ├── index.vue
│       │           ├── check-in.vue
│       │           ├── analytics.vue
│       │           └── members.vue
│       ├── components/         # Vue components
│       │   ├── CheckInForm.vue
│       │   └── CheckInFeed.vue
│       ├── composables/        # Composable functions
│       │   ├── useApi.ts       # API client
│       │   ├── useAuth.ts      # Authentication
│       │   ├── useTeam.ts      # Team operations
│       │   ├── useCheckIn.ts   # Check-in operations
│       │   └── useNotifications.ts
│       ├── stores/             # Pinia stores
│       │   ├── auth.ts
│       │   ├── team.ts
│       │   ├── checkIn.ts
│       │   └── notifications.ts
│       ├── middleware/         # Route middleware
│       │   ├── auth.ts
│       │   ├── team-member.ts
│       │   └── team-admin.ts
│       ├── layouts/            # Layout components
│       │   └── default.vue
│       ├── assets/             # Static assets
│       │   └── css/
│       │       └── main.css
│       ├── nuxt.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared TypeScript package
│       ├── src/
│       │   ├── types/         # TypeScript interfaces
│       │   │   ├── user.ts
│       │   │   ├── team.ts
│       │   │   ├── check-in.ts
│       │   │   └── notification.ts
│       │   ├── constants/     # Constants
│       │   │   ├── check-in.ts
│       │   │   └── mood.ts
│       │   ├── schemas/       # Zod validation schemas
│       │   │   ├── check-in.schema.ts
│       │   │   ├── team.schema.ts
│       │   │   └── user.schema.ts
│       │   └── index.ts       # Public exports
│       └── package.json
│
├── .env.example               # Environment template
├── .gitignore
├── .prettierrc
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace config
├── turbo.json                 # Turbo build config
├── README.md                  # Main documentation
├── SETUP.md                   # Quick setup guide
└── PROJECT_STRUCTURE.md       # This file
```

## Key Files

### Backend (NestJS)

- **`apps/api/src/main.ts`**: Application bootstrap, CORS, Swagger setup
- **`apps/api/src/app.module.ts`**: Root module, imports all feature modules
- **`apps/api/prisma/schema.prisma`**: Database schema with all models
- **`apps/api/prisma/seed.ts`**: Database seeding script

### Frontend (Nuxt 3)

- **`apps/web/nuxt.config.ts`**: Nuxt configuration, modules, runtime config
- **`apps/web/app.vue`**: Root component
- **`apps/web/layouts/default.vue`**: Default layout with navigation

### Shared Package

- **`packages/shared/src/index.ts`**: Exports all public types, constants, schemas

## Module Organization

### Backend Modules

Each module follows NestJS conventions:
- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `dto/` - Data transfer objects for validation

### Frontend Organization

- **Pages**: File-based routing (Nuxt convention)
- **Components**: Reusable Vue components
- **Composables**: Shared composable functions
- **Stores**: Pinia state management
- **Middleware**: Route guards and protection

## Data Flow

1. **User Action** → Frontend component
2. **Composable** → Calls API via `useApi()`
3. **API Request** → Backend controller
4. **Controller** → Service layer
5. **Service** → Prisma (database)
6. **Response** → Back to frontend
7. **Store Update** → Pinia store updated
8. **UI Update** → Component re-renders

## Authentication Flow

1. User logs in via Supabase Auth (frontend)
2. Supabase returns JWT token
3. Token stored in Supabase session
4. Frontend includes token in API requests (Bearer token)
5. Backend `JwtAuthGuard` validates token
6. User info extracted and attached to request
7. Guards check team membership/admin status

## Database Schema

- **User**: User accounts linked to Supabase Auth
- **Team**: Team/organization entities
- **TeamMembership**: Many-to-many relationship with roles
- **CheckIn**: Daily check-in submissions
- **CheckInAttachment**: File attachments for check-ins
- **Notification**: User notifications
- **NotificationPreference**: User notification settings

## Environment Variables

See `.env.example` for all required variables:
- Supabase credentials (URL, keys)
- Database connection strings
- Resend API key
- Application URLs

## Build & Deployment

- **Development**: `pnpm dev` (runs both frontend and backend)
- **Build**: `pnpm build` (builds all packages)
- **Backend**: NestJS compiles to `apps/api/dist/`
- **Frontend**: Nuxt generates to `apps/web/.output/`
- **Deployment**: Configured for Vercel (see `apps/api/vercel.json`)
