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
