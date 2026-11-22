# ShopLedger

## Stack

Node.js CommonJS app using Express and body-parser. `server.js` serves the
vanilla HTML/CSS/JavaScript UI in `public/`; `data/db.json` is the file-backed
datastore.

## Module map

- `routes/products.js` — product catalogue and active coupon endpoints.
- `routes/orders.js` — order listing, creation, lookup, and cancellation endpoints.
- `routes/customers.js` — customer/Khata listing and settlement endpoint.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and export endpoints.
- `lib/coupons.js` — coupon normalization, validation, calculation, and listing.
- `lib/dates.js` — date formatting, normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, stock checks, stock mutation, and summary.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, coupon discount, per-line GST, and checkout totals.
- `lib/reports.js` — dashboard and invoice-versus-ledger GST reconciliation.
- `lib/store.js` — synchronous JSON database read, write, and audit logging.
- `lib/tax.js` — GST-rate lookup and CGST/SGST split.

## Commands

- Start the app: `node server.js` (also exposed as `npm start`).
- Run tests: `node --test`; no test files exist today.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js`; use `lib/tax.js` only if truly needed.
