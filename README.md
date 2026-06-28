# FlagFlow Management SaaS

FlagFlow is a multi-tenant feature flag management system with one Express backend and three independent Next.js frontends:

- `backend`: Express + TypeScript + Prisma + PostgreSQL API
- `super-admin`: super admin console on port `3001`
- `admin`: organization admin console on port `3002`
- `user`: end-user feature check app on port `3003`

## Roles

- `super_admin`: creates organizations
- `org_admin`: creates, updates, and deletes feature flags for their own organization
- `end_user`: checks whether a feature is enabled for their own organization

## Prerequisites

- Node.js `18+`
- PostgreSQL running locally or remotely

## Setup

1. Clone the repo.
2. Backend setup:
   `cd backend`
   `cp .env.example .env`
   Fill in `DATABASE_URL` and `JWT_SECRET`
   `npm install`
   `npm run db:migrate`
   `npm run db:seed`
   `npm run dev`
3. Super-admin app:
   `cd super-admin`
   `npm install`
   `npm run dev`
   Runs on port `3001`
4. Admin app:
   `cd admin`
   `npm install`
   `npm run dev`
   Runs on port `3002`
5. User app:
   `cd user`
   `npm install`
   `npm run dev`
   Runs on port `3003`

## Default Super Admin Credentials

- Email: `superadmin@system.com`
- Password: `SuperAdmin@123`

These are controlled by the backend environment variables:

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

## Usage Flow

1. Log into the super-admin app and create an organization.
2. Sign up in the admin app for that organization.
3. Create feature flags in the admin dashboard.
4. Sign up in the user app for the same organization.
5. Check feature keys in the user app.
