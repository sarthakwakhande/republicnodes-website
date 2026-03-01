# Republic Nodes Ecommerce (Storefront + Admin + MySQL API)

This implementation is rebuilt as a cleaner production foundation for your requirements:

- MySQL-backed architecture
- Ubuntu VPS 24.04 deployment checklist
- Responsive UI (PC, tablet, mobile)
- SVG animation hero and modern storefront UI
- Admin-editable Razorpay/PayPal settings
- Admin-editable SMTP settings
- Product management + order tracking updates
- Delivery timeline messaging (packed → shipped → out for delivery → delivered)

## Architecture

- Frontend: `index.html`, `admin.html`, `styles.css`, `app.js`
- Backend API: `backend/server.js` (Express + MySQL + Nodemailer)
- DB schema: `backend/schema.sql`
- Env template: `backend/.env.example`

The frontend works in local mode (localStorage) and also syncs to API when reachable.

## MySQL Setup

```bash
mysql -u root -p
CREATE DATABASE republicnodes_store;
CREATE USER 'republicnodes'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON republicnodes_store.* TO 'republicnodes'@'%';
FLUSH PRIVILEGES;
mysql -u republicnodes -p republicnodes_store < backend/schema.sql
```

## API Endpoints

- `GET /api/health`
- `GET /api/settings/:type` where `type` is `payment|smtp|shipping`
- `POST /api/settings/:type`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/orders/:id/status`
- `POST /api/orders/:id/tracking`
- `POST /api/orders/:id/message` (also sends delivery email if SMTP env is present)

## Ubuntu VPS 24.04 Optimization Notes

- Use `ufw` firewall (`22`, `80`, `443` only; keep DB private)
- Use Nginx reverse proxy with HTTP/2 + gzip/brotli
- Run API via `pm2`
- Enable TLS with Let’s Encrypt
- Keep MySQL private and tune buffers per server RAM
- Use CDN/Cloudflare for static content

## Run

```bash
npm install
npm run check:js
npm run serve:api
# in another terminal
npm run serve:web
# open http://localhost:4173
```

## Notes before production launch

- Add proper auth (hashed passwords + JWT/session)
- Add validation/rate limiting and audit logging
- Use real Razorpay/PayPal webhook verification
- Move email and order events to background job queue
- Add object storage for product images

## GitHub Repository Update Status

All latest improvements are committed on the current branch and PR metadata has been updated each time so you can review and merge from GitHub.


## Troubleshooting: `npm install` says `Could not read package.json`

If your VPS clone only shows files like `README.md`, `index.html`, `admin.html`, `app.js`, `styles.css`, and **does not** show `package.json` or `backend/`, then you are on a reverted/static-only state of the repository.

Run these commands to verify and fix:

```bash
cd /var/www/republicnodes-website
ls -la
# must include: package.json and backend/

# confirm current commit + branch
git branch -vv
git log --oneline -n 5
```

If `package.json` or `backend/` are missing, switch to the branch/commit that contains full-stack files, or pull the correct branch from GitHub:

```bash
git fetch --all --prune
# example: checkout your working branch with backend files
git checkout <your-fullstack-branch>
git pull --ff-only

# verify again
ls -la
ls -la backend
```

Only after that run:

```bash
npm install
npm run check:js
npm run serve:api
```

If you intentionally want static-only mode (no Node/MySQL backend), use:

```bash
python3 -m http.server 4173
```

and skip `npm install`/API setup.
