# Relics Checker V2

Private two-person cultural heritage check-in app built with Vite, React, Supabase, Tencent COS, and Vercel API routes.

## Requirements

- Node.js 22.12.0 or newer
- Supabase project with the schema from `schema.sql`
- Tencent COS bucket for heritage and check-in photos
- Vercel or a local dev setup that can run `/api/*` functions

## Environment Variables

Server/API:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VERIFY_SECRET=long-random-token-signing-secret
PASSCODE_ZUO=...
PASSCODE_HUANG=...
COS_SECRET_ID=...
COS_SECRET_KEY=...
COS_BUCKET=heritage-1420709282
COS_REGION=ap-shanghai
```

`VERIFY_SECRET` is required. The API intentionally has no fallback secret.

## Data Access Model

- Browser code does not write Supabase tables directly.
- Check-in reads/writes go through `/api/checkins`.
- API routes validate the passcode-issued token and use `SUPABASE_SERVICE_ROLE_KEY`.
- `schema.sql` enables RLS and removes anon table policies, so the public anon key cannot directly read, insert, update, or delete check-ins.
- COS upload credentials are scoped to `checkin/{userId}/*`.

## Setup

```bash
npm install
npm run dev
```

Apply `schema.sql` in Supabase before using check-ins.

## Checks

```bash
npm run lint
npm run test:run
npm run build
npm audit --audit-level=high
```
