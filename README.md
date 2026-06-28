# Feature-Flag

Feature-Flag is a multi-tenant feature flag management system with one Express backend and three independent Next.js frontends:

[Super Admin Portal - feature-flag-super-admin](https://feature-flag-pi.vercel.app)
[Admin Portal - feature-flag-admin](https://feature-flag-admin-sigma.vercel.app)
[User Portal - feature-flag-user](https://feature-flag-yssi.vercel.app)

## Default Super Admin Credentials

- Email: `superadmin@system.com`
- Password: `SuperAdmin@123`

## Usage Flow

1. Log into the super-admin app and create an organization.
2. Sign up in the admin app for that organization.
3. Create feature flags in the admin dashboard.
4. Sign up in the user app for the same organization.
5. Check feature keys in the user app.
