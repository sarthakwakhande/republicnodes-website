# Republic Nodes Ecommerce + Admin Panel

This project delivers a complete ecommerce storefront and admin dashboard prototype for selling only first-party Republic Nodes products across Handmade, Luxury, Food, and Electronics categories.

## Included feature coverage

- Landing page with hero, featured products, testimonials, offers, categories, and search.
- Product system: catalog, filters, sorting, detail modal, similar products, wishlist, recently viewed.
- Cart + checkout: quantity updates, delivery charge logic, estimated date, coupon support, Razorpay + PayPal checkout buttons.
- User account simulation: signup/login, profile, order history, tracking, wishlist, saved addresses.
- Automatic email workflow simulation for order lifecycle + account flows.
- Search autocomplete.
- Support/policy sections.
- Responsive layout, lazy-loaded images, semantic structure, and SEO metadata.
- Admin panel: product CRUD, stock controls, categories/collections, discounts/coupons, order management, customer controls, email toggles, payment/shipping/content/review/analytics/security sections.

## Run locally

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Notes

- Data is persisted in browser localStorage for demo purposes.
- This is an extendable architecture baseline; production deployment should add server APIs, database, authentication, payment SDK integration, and transactional email providers.
