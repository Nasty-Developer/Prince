# Render deployment

This repository is configured as one Render Web Service. Express serves the
compiled React application and the existing API from the same origin.

## Commands

Render uses:

```text
Build: pnpm install --frozen-lockfile && pnpm run build
Pre-deploy: pnpm run db:migrate
Start: node artifacts/api-server/dist/index.mjs
Health check: /api/healthz
```

The frontend is built into `artifacts/savestreet-dogs/dist/public` and the
server serves `/api/*` before the SPA fallback.

The checked-in Drizzle baseline migration is applied by the pre-deploy command.
It is an incremental migration step, not `drizzle-kit push` or a destructive
startup schema change. Do not replace it with `push-force` in Render.

## Required environment variables

Set these in Render Environment Variables. Do not commit their values:

- `DATABASE_URL` — Render PostgreSQL connection string.
- `ADMIN_FIREBASE_UIDS` — comma-separated Firebase UIDs allowed to use admin APIs.
- `BASE_PATH` — set to `/`.
- `FIREBASE_PROJECT_ID` — the Firebase project used to verify ID tokens.
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

The `VITE_*` values are needed during the frontend build. Firebase Storage
uploads run directly from the authenticated admin browser and save persistent
Firebase download URLs in the existing `imageUrls` fields.

## Images and legacy object paths

New uploads use Firebase Storage and do not require the Replit object-storage
sidecar. The old `/objects/...` API routes are enabled only when the Replit
object-storage environment variables exist, so Render startup does not contact
`127.0.0.1:1106`.

If a database is migrated from a Replit development environment, migrate any
old `/objects/...` image references to Firebase URLs before switching traffic
to Render. The API preserves those legacy values rather than silently replacing
them with a Render-only URL.