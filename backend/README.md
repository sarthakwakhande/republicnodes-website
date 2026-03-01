# Backend (Express + MySQL + SMTP)

This folder contains the API server for Republic Nodes ecommerce.

## Files

- `server.js` — Express API with MySQL persistence and optional SMTP notifications.
- `schema.sql` — DB schema for `settings` and `orders`.
- `.env.example` — environment variable template.

## Quick setup

```bash
cp backend/.env.example backend/.env
# edit backend/.env with real DB and SMTP values
mysql -u republicnodes -p republicnodes_store < backend/schema.sql
npm run serve:api
```

## API endpoints

- `GET /api/health`
- `GET /api/settings/:type`
- `POST /api/settings/:type`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/orders/:id/status`
- `POST /api/orders/:id/tracking`
- `POST /api/orders/:id/message`

## Troubleshooting

### `Missing env var` warning on startup
Set required DB values in `backend/.env`:
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`

### SMTP not sending email
SMTP mail is optional. Ensure these are configured:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

If SMTP vars are not set, API still works and returns success for timeline updates (without sending email).
