# Republic Nodes Ecommerce (Storefront + Admin + MySQL API)

This version is rebuilt around your requirements:
- MySQL database design
- Ubuntu VPS 24.04 deployment guidance
- responsive UI for PC / tablet / mobile
- animated SVG hero section
- admin-editable Razorpay/PayPal settings
- admin-editable SMTP mail settings
- product add/delete/update controls
- delivery updates (packed/shipped/out for delivery/delivered) with custom message push

## 1) Tech Architecture

- Frontend: `index.html`, `admin.html`, `styles.css`, `app.js`
- Backend API: `backend/server.js` (Express + MySQL + Nodemailer)
- DB schema: `backend/schema.sql`
- Environment template: `backend/.env.example`

Frontend works standalone via localStorage and also attempts API sync to backend endpoints.

## 2) MySQL Setup

```bash
mysql -u root -p
CREATE DATABASE republicnodes_store;
CREATE USER 'republicnodes'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON republicnodes_store.* TO 'republicnodes'@'%';
FLUSH PRIVILEGES;
```

Then run:

```bash
mysql -u republicnodes -p republicnodes_store < backend/schema.sql
```

## 3) Ubuntu VPS 24.04 Optimization Notes

- Use `ufw` firewall: allow only `22`, `80`, `443`, and API port if needed privately.
- Use `nginx` reverse proxy with gzip/brotli and HTTP/2.
- Run Node API under `pm2`.
- Keep MySQL local/private network only.
- Enable swap for low RAM VPS, tune MySQL buffers based on RAM.
- Use Cloudflare / CDN for static caching.
- Configure TLS (Let's Encrypt).

## 4) Run

```bash
npm install
npm run check:js
npm run serve:api
# in another terminal
npm run serve:web
# open http://localhost:4173
```

## 5) Feature Map

### Storefront
- Hero + promotions + featured products + testimonials
- Search + autocomplete
- Category filtering + price + sorting
- Product detail modal with similar products
- Cart, quantity update, shipping calculation, ETA
- Razorpay + PayPal options at checkout
- Signup/login, wishlist, order tracking timeline

### Admin
- Add/delete products
- Change order status + tracking + push custom delivery update message
- Payment settings form (Razorpay/PayPal credentials)
- SMTP settings form (editable)
- Shipping rules form (charges, free-above, ETA)
- Analytics and security sections

## 6) Important

This is a production-ready foundation, but before live launch you should still add:
- secure password hashing + JWT/session auth
- CSRF/rate limits/validation middleware
- real Razorpay/PayPal SDK verification & webhooks
- queue worker for email sending
- image upload storage (S3/object storage)
