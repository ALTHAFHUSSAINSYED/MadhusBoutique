# Madhus Boutique — Production Architecture (V1)

Madhus Boutique is a secure, serverless e-commerce platform engineered specifically for digital machine embroidery designs (`.DST`, `.PES`, `.JEF`, `.EXP`).

---

## 1. Recommended V1 Technology Stack

| Layer | Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend & SSR** | Next.js 15 (App Router) + TypeScript | Modern React Server Components, fast edge rendering, zero runtime type errors. |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive luxury boutique aesthetic with curated colors, smooth transitions, and mobile-first design. |
| **Hosting & Compute** | Vercel Serverless Functions & Edge Middleware | Zero idle server cost (no always-on VPS/EC2 bills); auto-scales on demand with instant global CDN distribution. |
| **Relational Database** | Supabase PostgreSQL | Handles relational business data (customers, orders, items, payments, audit logs) with Row Level Security (RLS). |
| **Authentication & RBAC** | Supabase Auth + TOTP MFA | Multi-factor authentication for administrators with Role-Based Access Control (`SUPER_ADMIN`, `ORDER_MANAGER`, `CONTENT_MANAGER`). |
| **Binary Storage** | AWS S3 (100% Private Bucket) | Houses high-value embroidery design files, watermarked previews, pre-packaged ZIP archives, and payment QR images. |
| **Payment Workflow (V1)** | Direct UPI QR + Administrative UTR Verification | Zero payment gateway percentage fees for launch; zero onboarding friction; customer reference verification via admin dashboard. |

---

## 2. Realistic Storage & Cost Economics

* **Digital Design Asset Footprint**:
  * Starting catalogue: **~3 GB**
  * Projected near-term growth: **~5 GB**
* **Cost Efficiency**:
  * Putting design files in S3 avoids bloating the database. At ~5 GB, AWS S3 Standard costs **~$0.11 / month** (plus nominal GET/PUT request fees).
  * PostgreSQL only stores lightweight, queryable metadata (orders, customers, statuses, audit logs), easily staying well within standard database limits for tens of thousands of transactions.
  * **No "Free-Forever" Fallacy**: AWS S3 free tier is a 12-month introductory allowance; Supabase and Vercel operate on clear tiered quota models. The architecture is engineered so that when usage scales into paid tiers, the operational bill is measured in pennies, not hundreds of dollars.

---

## 3. Strict Storage Separation

* **AWS S3 (Private Bucket with Block Public Access ON)**:
  * `products/{product-code}/files/*` — Machine embroidery files (`.DST`, `.PES`, `.JEF`, `.EXP`)
  * `products/{product-code}/preview/*` — Watermarked preview images
  * `orders/{order-number}/downloads/*` — Short-lived generated ZIP archives
  * `payment/qr/*` — UPI QR graphics
* **Supabase PostgreSQL**:
  * Customers, product metadata, orders, order items, payments, statuses, admin profiles, audit logs, and download logs.

---

## 4. Digital Inventory Semantics

* Digital designs have infinite replicability; traditional physical stock counts (`stock = 10`) do not apply.
* Product lifecycle is managed via status:
  * `ACTIVE` — Publicly listed and purchasable.
  * `DRAFT` — Work-in-progress, visible only to administrators.
  * `ARCHIVED` — Retired design hidden from storefront.
  * `OUT_OF_SALE` — Temporarily withdrawn from sale.
* Physical `inventory_quantity` is reserved for potential future physical garment/blouse stitching services.

---

## 5. Security & Verification Guardrails

* **Zero-Trust Server Calculations**: Browser prices and totals are strictly ignored; all subtotal and total sums are computed server-side.
* **Row Level Security (RLS)**: Public browsers cannot read private orders, alter prices, or verify payments.
* **IDOR Defenses**: Orders use unguessable cryptographic tracking tokens (`tracking_token`) alongside human-readable IDs (`MB-YYYYMMDD-XXXXX`).
* **Presigned Delivery**: S3 files are never made public. Customers receive 15-minute expiring presigned URLs after server-side payment verification.
* **Lockout & Rate Limiting**: Administrative logins enforce 5-attempt brute-force lockouts (15 minutes); downloads and payment submissions enforce sliding-window rate limits.

---

## 6. Development & Quality Assurance

```bash
# Install dependencies
npm install

# Run local development server (port 3000)
npm run dev

# Run full automated test suite (95 tests across 13 test files)
npm test

# Run TypeScript strict type verification
npx tsc --noEmit

# Run ESLint code quality audit
npm run lint
```

