# EINCSHOP -- Enterprise Multi-Seller Digital Marketplace

A modern, production-grade digital assets marketplace built with Next.js 16.4.3 (App Router), React 19.2.8, TypeScript 5, Tailwind CSS v4, Prisma ORM 7.10.1, PostgreSQL (Supabase), Auth.js v5 Beta, Cloudflare Turnstile, and Midtrans Payment Gateway.

Think of it like a digital version of a shopping mall. Every seller gets their own locked storefront. Buyers browse the mall, pick items, pay at a secure automated cashier, and instantly receive a special ticket that unlocks their purchased digital files. No seller can peek into another seller's cash register or inventory -- everything is isolated, tamper-proof, and secure by design.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Architecture](#database-architecture)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Available Routes](#available-routes)
- [API Endpoints & Server Actions](#api-endpoints--server-actions)
- [Payment & Digital Delivery Flow](#payment--digital-delivery-flow)
- [Internationalization](#internationalization)
- [Security Practices](#security-practices)
- [License](#license)

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | `16.4.3` | Server Components, Server Actions, Route Handlers |
| **UI Library** | React & React DOM | `19.2.8` | Client hydration, optimistic UI, reactive state hooks |
| **Language** | TypeScript | `^5.0.0` | End-to-end static type safety |
| **Styling** | Tailwind CSS & PostCSS Plugin | `^4.0.0` | Modern design token system, CSS custom properties |
| **Database & ORM** | Prisma Client & CLI | `^7.10.1` | Object-Relational Mapping & migration engine |
| **DB Driver** | PostgreSQL (`pg` + `@prisma/adapter-pg`) | `^8.23.0` | Connection pooling engine with Supabase |
| **Cloud Storage** | `@vercel/blob` | `^2.8.0` | Private cloud storage for digital downloads & image assets |
| **Authentication** | Auth.js (`next-auth`) | `^5.0.0-beta.32` | JWT session management & Google OAuth integration |
| **Password Hashing** | `bcryptjs` | `^3.0.3` | Cost factor 12 cryptographic password salting & hashing |
| **Mailing Service** | `nodemailer` | `^8.0.11` | Automated 6-digit email OTP dispatching via secure SMTP |
| **Bot Defense** | Cloudflare Turnstile | Server API | Smart managed CAPTCHA on registration and authentication |
| **Payment Gateway** | Midtrans Core Snap API | Sandbox / Prod | Snap embedded checkout & SHA-512 signed webhooks |
| **Schema Validation** | Zod | `^4.6.5` | Type-safe form validation & strict sanitization |
| **Hosting & CI/CD** | Vercel Serverless Platform | Production | Automated continuous integration & zero-downtime deploys |

---

## Features

### For Buyers (Customers)

- **Product Catalog** -- Browse and search digital assets with category filtering, price/date sorting, search queries, and grid/list view toggles.
- **Guest-Friendly Cart** -- Persistent shopping cart that survives page refreshes via secure `einc_guest_id` cookies, without forcing upfront login.
- **Dedicated Checkout Flow** -- Dedicated `/checkout` screen validating product availability and locking prices against live database records.
- **Automated Cashier** -- Native integration with Midtrans Snap supporting Virtual Accounts, QRIS (GoPay, OVO, ShopeePay), Credit Cards, and Convenience Stores.
- **Expiring & Quota-Protected Downloads** -- Purchased digital assets are unlocked via cryptographic `DownloadGrant` records. Links automatically expire in **48 hours** and are hard-capped at **5 downloads** per asset.
- **Order History & Invoices** -- Real-time order tracking (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`) with itemized invoices.
- **User Profile Management** -- Manage account profile, change names, and update profile avatars.
- **Bilingual Storefront** -- Native support for English and Indonesian with automatic browser locale detection.

### For Sellers

- **Seller Onboarding Flow** -- Customer accounts seamlessly apply to become verified storefront operators via `/become-seller`.
- **Product Lifecycle Management** -- Create, edit, publish, and archive digital items. Upload image previews (validated with magic byte signatures), define integer IDR prices, assign categories, and attach downloadable payload files.
- **Financial Analytics & Cashflow Charts** -- Interactive sales dashboard featuring cashflow visualizations (Revenue, Platform Expense, Net Profit), key performance indicators, and automated 3% platform commission calculations (`AUTO_FEE_RATE = 0.03`).
- **Store Order Tracking** -- View incoming orders filtered strictly by products owned by the authenticated seller.
- **Category Control** -- Create and structure store categories.

### For Administrators

- **Full Platform Oversight** -- Centralized control over all platform products, categories, transactions, and store operations.
- **Immutable Security Audit Trail** -- Tamper-evident `AuditLog` records documenting actor ID, event name, target entity, timestamp, and source IP address.
- **Live Database Privilege Verification** -- Protected routes (`requireSuperAdmin`) query PostgreSQL in real-time on every single request, completely preventing stale JWT privilege escalation.

### Platform-Wide

- **Cloudflare Turnstile CAPTCHA** -- Frictionless, puzzle-free bot protection embedded in authentication forms and enforced at the Server Action layer.
- **Disposable Email Shield** -- User registration strictly restricted to `@gmail.com` accounts across Zod schemas and Google OAuth profiles.
- **Edge IP Anti-Spoofing** -- Resolves true client IPs by prioritizing Cloudflare's cryptographic `cf-connecting-ip` header.
- **Integer Minor-Unit Currency** -- All financial data is calculated in single integer Rupiah units (`priceMinor`), eliminating IEEE-754 floating-point rounding errors.
- **Zero-Downtime CI/CD** -- Automated Vercel deployments with atomic rollbacks and live database health checks.

---

## Database Architecture

The application runs on PostgreSQL managed via Prisma ORM 7 with connection pooling:

| Model | Table Name | Purpose | Key Attributes & Constraints |
|---|---|---|---|
| `User` | `users` | Account identity & profile | Role (`CUSTOMER`, `SELLER`, `ADMIN`), Status (`ACTIVE`, `SUSPENDED`), `storeName` |
| `Account` | `accounts` | OAuth provider credentials | Composite unique index on `[provider, providerAccountId]` |
| `Session` | `sessions` | Server-side auth sessions | `sessionToken` unique index, expiration timestamp |
| `Product` | `products` | Digital catalog entries | Integer price (`priceMinor`), status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `sellerId` relation |
| `Category` | `categories` | Product taxonomy | Unique `slug`, `isActive` index |
| `Cart` | `carts` | User shopping carts | Status (`ACTIVE`, `CONVERTED`, `ABANDONED`), compound index on `[userId, status]` |
| `CartItem` | `cart_items` | Items held in carts | Composite unique constraint on `[cartId, productId]` |
| `Order` | `orders` | Immutable sales invoices | Unique `orderNumber`, status (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`), `totalMinor` |
| `OrderItem` | `order_items` | Frozen line-item contract | Captures `productTitle`, `unitPriceMinor`, and references `Product` |
| `Payment` | `payments` | Financial transaction log | References `Order`, tracks provider (`MIDTRANS`, `DUMMY`) and payment status |
| `PaymentAttempt` | `payment_attempts` | Individual charge attempts | Unique `idempotencyKey`, provider reference ID |
| `PaymentEvent` | `payment_events` | Webhook audit trail | Composite unique constraint on `[provider, providerEventId]` for strict idempotency |
| `DigitalAsset` | `digital_assets` | Cloud storage references | Storage key pointers to `@vercel/blob`, file name, byte size, MIME type |
| `DownloadGrant` | `download_grants` | Cryptographic download access | Bound to `[orderItemId, digitalAssetId]`, `expiresAt` (48h), `downloadCount` (max 5x) |
| `AuditLog` | `audit_logs` | Security activity ledger | Actor user reference, action name, target entity ID, IP address, metadata JSON |
| `AuthRateLimit` | `auth_rate_limits` | Brute-force rate limiter | Primary key hashed via SHA-256 (`key`), attempt count, `blockedUntil` timestamp |
| `VerificationToken` | `verification_tokens` | 6-digit email OTP store | Composite identifier on `[identifier, token]`, 10-minute expiry |

---

## Project Structure

```text
eincshop/
├── prisma/
│   ├── schema.prisma          # Database models, enums, indexes, and relations
│   └── migrations/            # Version-controlled PostgreSQL migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication route group
│   │   │   ├── actions.ts     # Auth Server Actions (Register, Login, OTP Verify, Resend)
│   │   │   ├── auth-form.tsx  # Unified Login/Register UI with Google OAuth & Turnstile
│   │   │   ├── login/         # Customer and seller login page
│   │   │   ├── register/      # New account registration page
│   │   │   └── verify-otp/    # 6-digit email OTP verification form
│   │   ├── account/           # Customer portal (protected by requireUser)
│   │   │   ├── page.tsx       # Account dashboard
│   │   │   ├── profile/       # Profile management and avatar upload
│   │   │   ├── orders/        # Customer order history
│   │   │   └── downloads/     # Download center with real-time quota tracking
│   │   ├── admin/             # Seller and Admin portal (protected by requireAdmin)
│   │   │   ├── page.tsx       # Financial analytics dashboard with cashflow charts
│   │   │   ├── audit-logs/    # Security activity inspection (requireSuperAdmin)
│   │   │   ├── categories/    # Category management
│   │   │   ├── orders/        # Platform-wide and store-specific incoming orders
│   │   │   └── products/      # Product inventory, images, and digital asset attachments
│   │   ├── become-seller/     # Multi-seller onboarding application workflow
│   │   ├── cart/              # Persistent cart and dynamic quantity adjustment
│   │   ├── checkout/          # Pre-payment review and order initialization
│   │   ├── orders/            # Order invoices and status summaries
│   │   │   └── [orderNumber]/ # Invoice details and pay trigger
│   │   │       └── pay/       # Embedded Midtrans Snap client checkout
│   │   ├── products/          # Public catalog and localized product detail pages
│   │   │   └── [slug]/        # Individual product view
│   │   └── api/               # Serverless Route Handlers
│   │       ├── auth/          # NextAuth route handler ([...nextauth])
│   │       ├── downloads/     # Quota and expiry-protected asset streamer ([grantId])
│   │       ├── payments/      # Midtrans SHA-512 webhook verification handler
│   │       ├── product-images/# Product preview image proxy
│   │       └── profile-image/ # User avatar stream endpoint
│   ├── components/
│   │   ├── admin/             # FinancialChart, DeleteProductButton
│   │   ├── cart/              # AddToCartForm, CartItemList
│   │   ├── checkout/          # CheckoutForm
│   │   ├── layout/            # SiteHeader, MobileNav, SiteFooter, AccountMenu
│   │   ├── order/             # OrderStatus badges and summaries
│   │   ├── payment/           # MidtransSnapPayment, PayOrderButton
│   │   ├── product/           # ProductCard, CatalogControls, Pagination
│   │   └── ui/                # Button, Container, Turnstile, LoadingButton, Modal
│   ├── lib/
│   │   ├── admin/             # financial-analytics.ts, seller-metrics.ts
│   │   ├── auth/              # requireUser, requireAdmin, requireSuperAdmin, guest cookies
│   │   ├── auth.ts            # Auth.js configuration, callbacks, credentials provider
│   │   ├── db.ts              # PrismaClient singleton with PostgreSQL pool adapter
│   │   ├── email/             # sender.ts (Nodemailer Gmail SMTP with terminal fallback)
│   │   ├── format/            # currency.ts (formatIdr with minor-unit calculation)
│   │   ├── i18n/              # config.ts, server.ts, client.ts, dictionaries (en, id)
│   │   ├── security/          # turnstile.ts, password.ts, rate-limit.ts, request.ts, otp.ts, audit.ts
│   │   ├── storage/           # product-image.ts (magic byte image validator)
│   │   └── validation/        # auth.ts, catalog.ts (Zod validation schemas)
│   └── generated/
│       └── prisma/            # Local type-safe Prisma Client output
├── next.config.ts             # Security headers, server action limits, dev origins
├── package.json               # Dependencies and maintenance scripts
└── tsconfig.json              # TypeScript compilation rules and path aliases
```

---

## Environment Variables

All environment variables must be declared in your cloud hosting provider (e.g. Vercel Project Settings) or locally in `.env`:

| Variable Name | Required | Category | Description | Example Placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | **Yes** | Database | PostgreSQL connection string with pooling parameters | `postgresql://user:password@host:5432/db?sslmode=require` |
| `AUTH_SECRET` | **Yes** | Security | Secret string for encrypting Auth.js session JWT tokens | `generate-random-32-chars-string` |
| `AUTH_GOOGLE_ID` | Optional | Auth | Google Cloud OAuth Client ID for 1-Click login | `your-google-client-id.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Optional | Auth | Google Cloud OAuth Client Secret | `GOCSPX-yourGoogleClientSecret` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | **Yes** | Payments | Midtrans Client Key for rendering frontend Snap modals | `Mid-client-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_SERVER_KEY` | **Yes** | Payments | Midtrans Server Key for Snap API and webhook signatures | `Mid-server-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_IS_PRODUCTION` | Optional | Payments | Flag toggling Midtrans Production vs Sandbox endpoints | `false` (default) or `true` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Yes** | Security | Cloudflare Turnstile public site key for frontend widget | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `TURNSTILE_SECRET_KEY` | **Yes** | Security | Cloudflare Turnstile private secret key for server API | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `BLOB_READ_WRITE_TOKEN` | **Yes** | Storage | Access token for `@vercel/blob` private file storage | `vercel_blob_rw_xxxxxxxxxxxx` |
| `SMTP_USER` | Optional | Email | Gmail or custom SMTP address for sending OTP verification codes | `your-service@gmail.com` |
| `SMTP_PASS` | Optional | Email | SMTP App Password (16 characters, spaces stripped automatically) | `abcd efgh ijkl mnop` |
| `PAYMENT_PROVIDER` | Optional | Payments | Testing switch; set to `dummy` only in non-production environments | `midtrans` (default) |
| `NEXT_PUBLIC_APP_URL` | Optional | App | Base canonical domain of the application | `http://localhost:3000` |
| `NODE_ENV` | Optional | Runtime | Node.js execution environment | `development` or `production` |

---

## Getting Started

### Prerequisites

- Node.js version **20.x** or **22.x LTS**
- A running PostgreSQL database instance (e.g. Supabase, Neon, or local PostgreSQL 15+)
- Cloudflare Turnstile Site & Secret Keys
- Midtrans Merchant Account (Sandbox or Production)

### Installation

```bash
# 1. Clone repository and navigate to directory
git clone https://github.com/sukiliar8282/eincshop.git
cd eincshop

# 2. Install dependencies
npm install

# 3. Synchronize database schema and generate Prisma Client
npx prisma generate
npx prisma db push

# 4. Launch the local development server
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

Defined in `package.json`:

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | `prisma generate && next build` | Compiles Prisma Client and produces an optimized production build |
| `npm run start` | `next start` | Runs the compiled production build |
| `npm run lint` | `eslint` | Performs static ESLint code quality checks |
| `npm run postinstall` | `prisma generate` | Automatically generates local Prisma Client after `npm install` |

---

## Available Routes

### Public Storefront

| Route | Access | Description |
|---|---|---|
| `/` | Public | Homepage showcasing featured digital products and trust badges |
| `/products` | Public | Catalog with category filtering, keyword search, and sorting |
| `/products/[slug]` | Public | Individual product details with image previews |
| `/cart` | Public / Guest | Dynamic shopping cart linked to authenticated or guest sessions |
| `/checkout` | Public / Guest | Order review and confirmation screen before payment |

### Authentication

| Route | Access | Description |
|---|---|---|
| `/login` | Anonymous | Sign in via Google OAuth or Gmail/Password with Turnstile CAPTCHA |
| `/register` | Anonymous | Create a new buyer account restricted strictly to `@gmail.com` |
| `/verify-otp` | Unverified User | Enter 6-digit email verification OTP dispatched via SMTP |

### Buyer Portal

| Route | Access | Description |
|---|---|---|
| `/account` | Buyer (`CUSTOMER`) | Personal buyer overview |
| `/account/profile` | Buyer (`CUSTOMER`) | Update user profile and upload custom avatars |
| `/account/orders` | Buyer (`CUSTOMER`) | View order invoices and live payment statuses |
| `/account/downloads` | Buyer (`CUSTOMER`) | Download center showing active grants, expiry dates, and remaining quotas |

### Seller & Administrator Portal

| Route | Access | Description |
|---|---|---|
| `/become-seller` | Authenticated User | Onboarding form for buyers applying to operate a seller storefront |
| `/admin` | `SELLER` / `ADMIN` | Main operations dashboard with cashflow charts and metrics |
| `/admin/products` | `SELLER` / `ADMIN` | Inventory management (strictly isolated per seller; admin views all) |
| `/admin/products/new` | `SELLER` / `ADMIN` | Create new product and upload digital asset payload |
| `/admin/products/[id]` | `SELLER` / `ADMIN` | Product detail overview |
| `/admin/products/[id]/edit` | `SELLER` / `ADMIN` | Edit product metadata, pricing, and category |
| `/admin/products/[id]/images` | `SELLER` / `ADMIN` | Manage product gallery photos (magic byte validation) |
| `/admin/products/[id]/assets` | `SELLER` / `ADMIN` | Manage downloadable digital files |
| `/admin/categories` | `SELLER` / `ADMIN` | Create and manage product category taxonomy |
| `/admin/orders` | `SELLER` / `ADMIN` | Incoming store orders (filtered per seller; admin views all) |
| `/admin/audit-logs` | Super Admin (`ADMIN`) | System security activity logs (strictly restricted to `ADMIN`) |

### Orders & Payment

| Route | Access | Description |
|---|---|---|
| `/orders/[orderNumber]` | Order Owner | Itemized invoice with download action for settled orders |
| `/orders/[orderNumber]/pay` | Order Owner | Embedded Midtrans Snap checkout popup trigger |

---

## API Endpoints & Server Actions

### Route Handlers

| Endpoint | Method | Authorization | Purpose |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | Public | Auth.js session negotiation, OAuth callbacks, and signout |
| `/api/downloads/[grantId]` | `GET` | Session User | Securely streams digital files verifying 48h expiry and 5x quota |
| `/api/payments/midtrans` | `POST` | Midtrans Webhook | Verifies SHA-512 signature, processes payments, and creates grants |
| `/api/product-images/[imageId]` | `GET` | Public | Delivers product preview images from storage |
| `/api/profile-image` | `GET` | Authenticated | Delivers user profile avatar |

### Key Server Actions

| Server Action | Defined In | Access | Security Controls |
|---|---|---|---|
| `registerAction` | `src/app/(auth)/actions.ts` | Public | Zod validation, `@gmail.com` enforcement, Turnstile, Rate limit |
| `loginAction` | `src/app/(auth)/actions.ts` | Public | Zod validation, Turnstile, Rate limit, Auth.js credentials verification |
| `verifyOtpAction` | `src/app/(auth)/actions.ts` | Public | 6-digit regex, Rate limit (5 attempts/10m), SHA-256 compare, AuditLog |
| `resendOtpAction` | `src/app/(auth)/actions.ts` | Public | Rate limit (3 attempts/15m), cryptographic OTP regeneration, Nodemailer |
| `addToCartAction` | `src/app/cart/actions.ts` | Public / Guest | Live stock check, atomic cart item upsert |
| `createOrderAction` | `src/modules/orders/actions.ts` | User / Guest | Atomic `$transaction`, re-calculates prices from DB, creates Order |
| `createMidtransPaymentAction` | `src/modules/payments/actions.ts` | Order Owner | Order status verification, Midtrans Snap token generation |
| `uploadProductImageAction` | `src/modules/catalog/image-actions.ts` | Seller / Admin | Tenant ownership check, magic byte signature check, max 5MB, Blob upload |
| `becomeSellerAction` | `src/app/become-seller/actions.ts` | Customer | Zod validation, promotes role to `SELLER`, records `AuditLog` |

---

## Payment & Digital Delivery Flow

```text
[Buyer / Guest] ──> Adds Product to Cart
       │
       ▼
[Checkout (/checkout)] ──> Server Action creates Order via $transaction (Prices locked from DB)
       │
       ▼
[Midtrans Snap API] ──> Returns Snap Token & Redirect URL
       │
       ▼
[Buyer Pays] ──> Virtual Account / QRIS / Credit Card
       │
       ▼
[Midtrans Webhook (/api/payments/midtrans)]
       │
       ├── 1. Verify SHA-512 Signature (order_id + status_code + gross_amount + serverKey)
       ├── 2. Validate Currency (IDR) & Amount against order.totalMinor in DB
       ├── 3. Execute Atomic $transaction:
       │      ├── Update Payment status -> PAID
       │      ├── Update Order status -> PAID
       │      ├── Mark Cart status -> CONVERTED
       │      └── Insert PaymentEvent (Idempotent via unique constraint)
       │
       └── 4. Trigger createDownloadGrantsForPaidOrder:
              └── Issues DownloadGrant (expiresAt = now + 48h, downloadCount = 0)
                     │
                     ▼
[Buyer Accesses /account/downloads or /orders/[orderNumber]]
       │
       ▼
[Download Request (/api/downloads/[grantId])]
       ├── Checks: session.user.id == grant.userId
       ├── Checks: order.paymentStatus == "PAID"
       ├── Checks: now <= grant.expiresAt (48 Hours Lifetime)
       ├── Checks: grant.downloadCount < 5 (Max Quota)
       ├── Atomically increments downloadCount by +1
       └── Streams binary payload from private @vercel/blob storage
```

---

## Internationalization

The marketplace features a built-in bilingual architecture:

1. User language preference is stored in an HTTP cookie named `einc_locale` (sanitized defensively to either `id` or `en`; defaults to `en`).
2. Server Components read the dictionary (`id.ts` or `en.ts`) server-side via `getDictionary()`, introducing zero bundle bloat to client browsers.
3. Client components consume translations using the reactive `useI18n()` hook.
4. Currency formatting dynamically adjusts:
   - Indonesian: `Rp 150.000` (`id-ID`)
   - English: `IDR 150,000` (`en-US`)

---

## Security Practices

### 1. Integer Minor-Unit Currency

- **Threat Prevented**: Floating-point rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`), resulting in accounting discrepancies and payment gateway mismatch rejections.
- **Mechanism**: All product prices, line totals, and order subtotals are stored and manipulated as integers representing single Rupiahs (`priceMinor`). Think of it like counting physical single-rupiah coins rather than fractional decimal bills.
- **Implementation**: `src/lib/format/currency.ts`, `prisma/schema.prisma`, `src/modules/orders/service.ts`.
- **Usage**: Always assign `priceMinor: Math.round(priceInRupiah)` and format via `formatIdr(amountMinor, locale)`.

### 2. Multi-Tenant Seller Isolation & Live DB Privilege Checks

- **Threat Prevented**: Unauthorized cross-tenant data leaks and horizontal privilege escalation (e.g. Seller A accessing or deleting Seller B's inventory, or suspended users continuing with stale JWT sessions).
- **Mechanism**: Seller identity is never trusted from client inputs. `requireAdmin()` and query builders extract the authenticated user ID and enforce `{ sellerId: admin.id }` for all non-superadmin actors. Every privileged request queries PostgreSQL directly to verify that the account status remains `ACTIVE`.
- **Implementation**: `src/lib/auth/require-user.ts`, `src/app/admin/products/page.tsx`, `src/modules/catalog/image-actions.ts`.
- **Usage**: Wrap all administrative pages with `await requireAdmin()` or `await requireSuperAdmin()`.

### 3. Expiring & Quota-Limited Download Grants

- **Threat Prevented**: Unauthorized file redistribution, permanent download URL leaks, and bandwidth leeching.
- **Mechanism**: Downloadable digital assets are never exposed via public URLs. Assets reside in private storage (`@vercel/blob`). Access requires an active database `DownloadGrant` bound to the verified buyer. Downloads strictly validate that current time is under `expiresAt` (**48 hours**) and total downloads do not exceed `MAX_DOWNLOAD_LIMIT` (**5 times**).
- **Implementation**: `src/app/api/downloads/[grantId]/route.ts`, `src/modules/digital-delivery/service.ts`.
- **Usage**: Generated automatically upon order settlement via `createDownloadGrantsForPaidOrder(orderId)`.

### 4. Cloudflare Turnstile Bot Defense

- **Threat Prevented**: Automated bot account creation, credential stuffing, and spam attacks on authentication endpoints.
- **Mechanism**: Both login and registration forms render a non-intrusive Turnstile widget. The received token is transmitted to `actions.ts` and verified server-side against `https://challenges.cloudflare.com/turnstile/v0/siteverify` before processing credentials.
- **Implementation**: `src/components/ui/turnstile.tsx`, `src/lib/security/turnstile.ts`, `src/app/(auth)/actions.ts`.
- **Usage**: Embed `<Turnstile />` in forms and invoke `await verifyTurnstileToken(token, requestIp)` in actions.

### 5. Disposable Email Shield & 6-Digit Cryptographic OTP

- **Threat Prevented**: Fake registrations via burner/disposable email services, bot account proliferation, and unverified identity spoofing.
- **Mechanism**: Registration input is strictly restricted to `@gmail.com` via Zod regex. Newly registered accounts require verifying a 6-digit cryptographic OTP code generated via `randomInt`, hashed using SHA-256 in the database, and dispatched via Gmail SMTP. Unverified accounts are prevented from accessing buyer/seller areas.
- **Implementation**: `src/lib/validation/auth.ts`, `src/lib/security/otp.ts`, `src/lib/email/sender.ts`, `src/app/(auth)/verify-otp/`.
- **Usage**: Enforced automatically in `registerAction` and guarded by `requireUser()`.

### 6. Edge IP Anti-Spoofing & Real Client Resolution

- **Threat Prevented**: Rate-limiter bypass and IP spoofing attacks via forged `X-Forwarded-For` HTTP headers.
- **Mechanism**: The system resolves incoming IP addresses through a strict hierarchy prioritizing Cloudflare's cryptographic `cf-connecting-ip` edge header over standard proxy headers.
- **Implementation**: `src/lib/security/request.ts`.
- **Usage**: Invoke `const clientIp = await getRequestIp();` in server actions and audit loggers.

### 7. SHA-512 Webhook Signature & Idempotent Event Ledger

- **Threat Prevented**: Forged payment notifications, fake settlement webhooks, and double-crediting orders through duplicate webhook deliveries.
- **Mechanism**: Midtrans webhook payloads are verified by hashing `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY` with SHA-512 and comparing via `crypto.timingSafeEqual`. Webhook processing runs in an atomic `$transaction` that creates a `PaymentEvent` record constrained by `@@unique([provider, providerEventId])`, guaranteeing strict idempotency.
- **Implementation**: `src/app/api/payments/midtrans/route.ts`.
- **Usage**: Handled automatically on `POST /api/payments/midtrans`.

### 8. Magic Byte Image File Verification

- **Threat Prevented**: Malicious executable file uploads disguised with fake image extensions (e.g. PHP or executable scripts renamed to `.jpg`).
- **Mechanism**: Image uploads do not rely on client-supplied MIME types or file extensions. The server inspects the initial 12 bytes of the file buffer to confirm legitimate file signatures (JPEG `0xFF 0xD8 0xFF`, PNG `0x89 0x50 0x4E 0x47`, WebP `RIFF...WEBP`) and enforces a 5MB limit.
- **Implementation**: `src/lib/storage/product-image.ts`.
- **Usage**: Processed inside `uploadProductImageAction`.

### 9. Database-Backed Rate Limiting with SHA-256 Hashing

- **Threat Prevented**: Password brute-force attacks, OTP enumeration, and resource exhaustion.
- **Mechanism**: Authentication attempts are throttled by `consumeAuthRateLimit`. The storage identifier is hashed with SHA-256 before saving to PostgreSQL, ensuring client IPs and emails are not stored in plaintext. Expired records are pruned probabilistically (5% chance per request) to prevent table bloat.
- **Implementation**: `src/lib/security/rate-limit.ts`.
- **Usage**: Call `await consumeAuthRateLimit(key, options)` before executing sensitive actions.

### 10. HTTP Security Headers & Hardened Defaults

- **Threat Prevented**: Cross-Site Scripting (XSS), Clickjacking, MIME-sniffing, and SSL-stripping man-in-the-middle attacks.
- **Mechanism**: `next.config.ts` enforces HTTP headers globally: HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Cross-Origin-Opener-Policy: same-origin-allow-popups`. `poweredByHeader` is explicitly disabled.
- **Implementation**: `next.config.ts`.
- **Usage**: Applied automatically to all outgoing HTTP responses.

---
---

# EINCSHOP -- Platform Marketplace Aset Digital Multi-Seller

Platform marketplace aset digital modern dan siap produksi yang dibangun dengan Next.js 16.4.3 (App Router), React 19.2.8, TypeScript 5, Tailwind CSS v4, Prisma ORM 7.10.1, PostgreSQL (Supabase), Auth.js v5 Beta, Cloudflare Turnstile, dan Midtrans Payment Gateway.

Bayangkan seperti versi digital dari sebuah pusat perbelanjaan. Setiap penjual memiliki etalase toko sendiri yang terkunci. Pembeli menjelajahi mall, memilih produk, membayar di kasir otomatis yang aman, lalu langsung menerima tiket digital khusus yang membuka akses unduhan file yang telah dibeli. Tidak ada penjual yang dapat mengintip kasir atau stok inventaris penjual lain -- seluruh arsitektur terisolasi, aman, dan anti-manipulasi sejak awal.

---

## Daftar Isi

- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Fitur-Fitur](#fitur-fitur)
- [Arsitektur Database](#arsitektur-database)
- [Struktur Proyek](#struktur-proyek)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Cara Memulai](#cara-memulai)
- [Perintah Tersedia](#perintah-tersedia)
- [Daftar Rute Halaman](#daftar-rute-halaman)
- [Endpoint API & Server Actions](#endpoint-api--server-actions)
- [Alur Pembayaran & Pengiriman Digital](#alur-pembayaran--pengiriman-digital)
- [Internasionalisasi](#internasionalisasi)
- [Praktik Keamanan](#praktik-keamanan)
- [Lisensi](#license)

---

## Teknologi yang Digunakan

| Lapisan | Teknologi | Versi | Fungsi |
|---|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | `16.4.3` | Server Components, Server Actions, Route Handlers |
| **Library UI** | React & React DOM | `19.2.8` | Hidrasi client, antarmuka optimistik, reactive hooks |
| **Bahasa Pemrograman** | TypeScript | `^5.0.0` | Jaminan keamanan tipe statis ujung-ke-ujung |
| **Styling** | Tailwind CSS & PostCSS Plugin | `^4.0.0` | Desain token modern, CSS custom properties |
| **Database & ORM** | Prisma Client & CLI | `^7.10.1` | Object-Relational Mapping & engine migrasi skema |
| **Driver Database** | PostgreSQL (`pg` + `@prisma/adapter-pg`) | `^8.23.0` | Connection pooling terintegrasi dengan Supabase |
| **Penyimpanan Cloud** | `@vercel/blob` | `^2.8.0` | Penyimpanan privat untuk aset digital dan foto produk |
| **Autentikasi** | Auth.js (`next-auth`) | `^5.0.0-beta.32` | Manajemen sesi JWT & login 1-klik Google OAuth |
| **Hashing Password** | `bcryptjs` | `^3.0.3` | Hashing dan salting password kriptografis (cost factor 12) |
| **Layanan Email** | `nodemailer` | `^8.0.11` | Pengiriman otomatis kode OTP 6-digit via SMTP aman |
| **Proteksi Bot** | Cloudflare Turnstile | Server API | CAPTCHA pintar tanpa puzzle pada formulir auth |
| **Payment Gateway** | Midtrans Core Snap API | Sandbox / Prod | Kasir pembayaran Snap & webhook bertanda tangan SHA-512 |
| **Validasi Skema** | Zod | `^4.6.5` | Validasi tipe data formulir & filter wajib Gmail |
| **Hosting & CI/CD** | Vercel Serverless Platform | Production | Pipeline integrasi otomatis GitHub & deploy tanpa downtime |

---

## Fitur-Fitur

### Untuk Pembeli (Customer)

- **Katalog Produk Digital** -- Jelajahi dan cari produk digital dengan filter kategori, pengurutan harga/tanggal, pencarian kata kunci, dan mode tampilan grid/list.
- **Keranjang Belanja Ramah Pengunjung** -- Keranjang belanja persisten yang tetap tersimpan saat halaman di-refresh menggunakan cookie aman `einc_guest_id` tanpa memaksa login di awal.
- **Halaman Checkout Terisolasi** -- Halaman `/checkout` khusus untuk meninjau pesanan dan mengunci harga asli langsung dari baris database.
- **Kasir Pembayaran Otomatis** -- Terintegrasi penuh dengan Midtrans Snap mendukung Transfer Bank (Virtual Account), QRIS (GoPay, OVO, ShopeePay), Kartu Kredit, dan Minimarket.
- **Unduhan Berkuota & Berbatas Waktu** -- Tiket `DownloadGrant` otomatis dibuat begitu pembayaran lunas. Tautan unduh dibatasi aktif selama **48 jam** dan kuota unduhan dibatasi maksimal **5 kali** per file aset.
- **Riwayat & Faktur Pesanan** -- Pelacakan status pesanan secara real-time (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`) lengkap dengan rincian biaya.
- **Profil Pengguna** -- Kelola informasi profil akun dan unggah foto avatar pribadi.
- **Antarmuka Dwibahasa** -- Dukungan penuh Bahasa Indonesia dan Bahasa Inggris dengan deteksi preferensi bahasa peramban otomatis.

### Untuk Penjual (Seller)

- **Alur Pendaftaran Penjual** -- Pengguna terdaftar dapat mendaftar menjadi penjual resmi melalui alur onboarding `/become-seller`.
- **Manajemen Siklus Produk** -- Buat, edit, publikasikan, atau arsipkan produk digital. Unggah gambar pratinjau (diverifikasi dengan magic byte), atur harga integer Rupiah, tentukan kategori, dan unggah file payload digital ke storage privat.
- **Dashboard Analitik Keuangan & Grafik Cashflow** -- Panel analitik visual untuk memantau grafik cashflow interaktif (Pendapatan Kotor, Potongan Platform, Pendapatan Bersih), indikator performa utama, dan kalkulasi komisi otomatis 3% (`AUTO_FEE_RATE = 0.03`).
- **Pengawasan Pesanan Toko** -- Pantau pesanan masuk yang terisolasi khusus untuk produk milik penjual yang sedang login.
- **Manajemen Kategori** -- Atur kategori etalase produk toko Anda.

### Untuk Administrator

- **Pengawasan Menyeluruh Platform** -- Kendali komprehensif atas seluruh produk, kategori, pesanan, dan operasional pasar.
- **Log Audit Anti-Manipulasi** -- Tabel `AuditLog` yang mencatat aktor, nama aksi, entitas target, stempel waktu, dan alamat IP pengunjung.
- **Validasi Hak Akses Real-Time (RBAC)** -- Rute yang dilindungi (`requireSuperAdmin`) memvalidasi status akun langsung ke database PostgreSQL pada setiap request, menutup celah pemalsuan hak akses melalui token JWT usang.

### Seluruh Platform

- **Perlindungan CAPTCHA Cloudflare Turnstile** -- Perlindungan bot pintar pada formulir Login dan Registrasi tanpa menyulitkan calon pembeli.
- **Aturan Ketat Wajib Gmail** -- Pendaftaran akun dibatasi hanya menerima email `@gmail.com` guna mematikan bot pembuat akun dan email sekali pakai.
- **Anti-Spoofing IP Edge** -- Membaca alamat IP pengunjung dengan memprioritaskan header resmi `cf-connecting-ip` dari jaringan Cloudflare.
- **Mata Uang Integer Bebas Error** -- Seluruh nominal uang disimpan dalam satuan Rupiah bulat terkecil (`priceMinor`) untuk menghilangkan bug kalkulasi floating-point JavaScript.
- **Deploy Otomatis Tanpa Downtime** -- Terhubung langsung dengan pipeline Vercel dan GitHub; website diperbarui otomatis setiap kali Anda menjalankan `git push`.

---

## Arsitektur Database

Aplikasi berjalan di atas PostgreSQL yang dikelola melalui Prisma ORM 7 dengan adapter connection pooling:

| Model | Nama Tabel | Fungsi | Atribut & Constraint Kunci |
|---|---|---|---|
| `User` | `users` | Identitas akun & profil | Peran (`CUSTOMER`, `SELLER`, `ADMIN`), Status (`ACTIVE`, `SUSPENDED`), `storeName` |
| `Account` | `accounts` | Kredensial provider OAuth | Indeks unik gabungan `[provider, providerAccountId]` |
| `Session` | `sessions` | Rekaman sesi login server | Indeks unik `sessionToken`, stempel kedaluwarsa |
| `Product` | `products` | Katalog produk digital | Harga integer (`priceMinor`), status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), relasi `sellerId` |
| `Category` | `categories` | Taksonomi kategori produk | Indeks unik `slug`, indeks status `isActive` |
| `Cart` | `carts` | Keranjang belanja pengguna | Status (`ACTIVE`, `CONVERTED`, `ABANDONED`), indeks gabungan `[userId, status]` |
| `CartItem` | `cart_items` | Item dalam keranjang belanja | Constraint unik gabungan `[cartId, productId]` |
| `Order` | `orders` | Faktur transaksi penjualan | Indeks unik `orderNumber`, status (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`), `totalMinor` |
| `OrderItem` | `order_items` | Kontrak item pesanan terkunci | Mengunci `productTitle`, `unitPriceMinor`, dan mereferensikan `Product` |
| `Payment` | `payments` | Jejak audit transaksi | Mereferensikan `Order`, mencatat provider (`MIDTRANS`, `DUMMY`) dan status pembayaran |
| `PaymentAttempt` | `payment_attempts` | Percobaan penagihan pembayaran | Kunci unik `idempotencyKey`, referensi ID provider |
| `PaymentEvent` | `payment_events` | Buku besar webhook | Constraint unik gabungan `[provider, providerEventId]` untuk menjamin idempotensi mutlak |
| `DigitalAsset` | `digital_assets` | Referensi penyimpanan cloud | Kunci penyimpanan `@vercel/blob`, nama file, ukuran byte, tipe MIME |
| `DownloadGrant` | `download_grants` | Tiket akses unduh digital | Terikat pada `[orderItemId, digitalAssetId]`, `expiresAt` (48 jam), `downloadCount` (maksimal 5x) |
| `AuditLog` | `audit_logs` | Buku besar audit keamanan | Relasi aktor pengguna, nama aksi, ID entitas target, alamat IP, metadata JSON |
| `AuthRateLimit` | `auth_rate_limits` | Pembatas serangan brute-force | Kunci primer ter-hash SHA-256 (`key`), hitungan percobaan, batas waktu `blockedUntil` |
| `VerificationToken` | `verification_tokens` | Penyimpanan OTP email | Identifier gabungan `[identifier, token]`, kedaluwarsa 10 menit |

---

## Struktur Proyek

```text
eincshop/
├── prisma/
│   ├── schema.prisma          # Model database, enum, indeks, dan relasi PostgreSQL
│   └── migrations/            # Riwayat migrasi database terkelola
├── src/
│   ├── app/
│   │   ├── (auth)/            # Grup rute autentikasi
│   │   │   ├── actions.ts     # Server Actions auth (Register, Login, Verifikasi OTP, Kirim Ulang)
│   │   │   ├── auth-form.tsx  # Form UI dengan Google OAuth & Turnstile CAPTCHA
│   │   │   ├── login/         # Halaman masuk pelanggan dan penjual
│   │   │   ├── register/      # Halaman pendaftaran akun baru
│   │   │   └── verify-otp/    # Halaman input kode verifikasi email 6-digit
│   │   ├── account/           # Portal pelanggan (dilindungi requireUser)
│   │   │   ├── page.tsx       # Beranda dashboard akun
│   │   │   ├── profile/       # Pengelolaan data profil dan avatar
│   │   │   ├── orders/        # Riwayat faktur pesanan pembeli
│   │   │   └── downloads/     # Pusat unduhan file aset berkuota
│   │   ├── admin/             # Portal penjual dan admin (dilindungi requireAdmin)
│   │   │   ├── page.tsx       # Dashboard analitik keuangan & grafik cashflow
│   │   │   ├── audit-logs/    # Inspeksi log aktivitas keamanan (requireSuperAdmin)
│   │   │   ├── categories/    # Manajemen kategori produk
│   │   │   ├── orders/        # Pesanan masuk toko dan platform
│   │   │   └── products/      # Inventaris produk, galeri gambar, dan lampiran file digital
│   │   ├── become-seller/     # Alur pendaftaran menjadi penjual terverifikasi
│   │   ├── cart/              # Keranjang belanja dinamis
│   │   ├── checkout/          # Halaman tinjauan pesanan sebelum kasir pembayaran
│   │   ├── orders/            # Faktur pesanan dan rincian transaksi
│   │   │   └── [orderNumber]/ # Rincian faktur dan tombol bayar
│   │   │       └── pay/       # Antarmuka kasir pembayaran pop-up Midtrans Snap
│   │   ├── products/          # Katalog publik dan halaman detail produk ter-lokalisasi
│   │   │   └── [slug]/        # Tampilan produk individual
│   │   └── api/               # Serverless Route Handlers
│   │       ├── auth/          # Handler rute NextAuth ([...nextauth])
│   │       ├── downloads/     # Streaming file berkuota & berbatas waktu ([grantId])
│   │       ├── payments/      # Handler webhook Midtrans dengan validasi tanda tangan SHA-512
│   │       ├── product-images/# Penyaji foto pratinjau produk
│   │       └── profile-image/ # Penyaji foto profil pengguna
│   ├── components/
│   │   ├── admin/             # FinancialChart, DeleteProductButton
│   │   ├── cart/              # AddToCartForm, CartItemList
│   │   ├── checkout/          # CheckoutForm
│   │   ├── layout/            # SiteHeader, MobileNav, SiteFooter, AccountMenu
│   │   ├── order/             # Badge status pesanan dan ringkasan transaksi
│   │   ├── payment/           # MidtransSnapPayment, PayOrderButton
│   │   ├── product/           # ProductCard, CatalogControls, Pagination
│   │   └── ui/                # Button, Container, Turnstile, LoadingButton, Modal
│   ├── lib/
│   │   ├── admin/             # financial-analytics.ts, seller-metrics.ts
│   │   ├── auth/              # requireUser, requireAdmin, requireSuperAdmin, guest cookies
│   │   ├── auth.ts            # Konfigurasi Auth.js, callback, provider credentials
│   │   ├── db.ts              # Inisialisasi PrismaClient dengan adapter pool PostgreSQL
│   │   ├── email/             # sender.ts (SMTP Gmail Nodemailer dengan fallback konsol)
│   │   ├── format/            # currency.ts (formatIdr dengan kalkulasi mata uang integer)
│   │   ├── i18n/              # config.ts, server.ts, client.ts, kamus bahasa (id, en)
│   │   ├── security/          # turnstile.ts, password.ts, rate-limit.ts, request.ts, otp.ts, audit.ts
│   │   ├── storage/           # product-image.ts (pemeriksa magic byte signature gambar)
│   │   └── validation/        # auth.ts, catalog.ts (skema validasi Zod)
│   └── generated/
│       └── prisma/            # Output Prisma Client type-safe lokal
├── next.config.ts             # Header keamanan HTTP, batas server actions, dev origins
├── package.json               # Dependensi dan script pemeliharaan sistem
└── tsconfig.json              # Aturan kompilasi TypeScript dan alias path
```

---

## Variabel Lingkungan

Seluruh variabel lingkungan harus didaftarkan di pengaturan hosting cloud (mis. Vercel Project Settings) atau di file `.env` lokal:

| Nama Variabel | Wajib | Kategori | Deskripsi | Contoh Placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | **Ya** | Database | String koneksi PostgreSQL dengan parameter connection pooling | `postgresql://user:password@host:5432/db?sslmode=require` |
| `AUTH_SECRET` | **Ya** | Keamanan | String acak untuk mengenkripsi token sesi JWT Auth.js | `generate-random-32-chars-string` |
| `AUTH_GOOGLE_ID` | Opsional | Auth | Client ID Google Cloud OAuth untuk fitur login 1-klik | `your-google-client-id.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Opsional | Auth | Client Secret Google Cloud OAuth | `GOCSPX-yourGoogleClientSecret` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | **Ya** | Pembayaran | Client Key Midtrans untuk memunculkan antarmuka modal Snap | `Mid-client-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_SERVER_KEY` | **Ya** | Pembayaran | Server Key Midtrans untuk API Snap dan verifikasi webhook | `Mid-server-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_IS_PRODUCTION` | Opsional | Pembayaran | Menentukan endpoint Midtrans mode Sandbox atau Production | `false` (default) atau `true` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Ya** | Keamanan | Site Key publik Cloudflare Turnstile untuk widget frontend | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `TURNSTILE_SECRET_KEY` | **Ya** | Keamanan | Secret Key privat Cloudflare Turnstile untuk validasi server | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `BLOB_READ_WRITE_TOKEN` | **Ya** | Storage | Token otorisasi `@vercel/blob` untuk penyimpanan file privat | `vercel_blob_rw_xxxxxxxxxxxx` |
| `SMTP_USER` | Opsional | Email | Alamat email SMTP (mis. Gmail) untuk mengirim kode OTP | `your-service@gmail.com` |
| `SMTP_PASS` | Opsional | Email | App Password SMTP (16 karakter, spasi otomatis dibersihkan) | `abcd efgh ijkl mnop` |
| `PAYMENT_PROVIDER` | Opsional | Pembayaran | Switch pengujian; set ke `dummy` hanya pada mode development | `midtrans` (default) |
| `NEXT_PUBLIC_APP_URL` | Opsional | App | Domain kanonikal utama aplikasi | `http://localhost:3000` |
| `NODE_ENV` | Opsional | Runtime | Lingkungan eksekusi Node.js | `development` atau `production` |

---

## Cara Memulai

### Prasyarat

- Node.js versi **20.x** atau **22.x LTS**
- Database PostgreSQL yang aktif (Supabase, Neon, atau instance PostgreSQL 15+ lokal)
- Kunci Site Key & Secret Key Cloudflare Turnstile
- Akun Merchant Midtrans (Sandbox atau Production)

### Instalasi

```bash
# 1. Klon repositori dan masuk ke direktori proyek
git clone https://github.com/sukiliar8282/eincshop.git
cd eincshop

# 2. Pasang dependensi
npm install

# 3. Sinkronisasikan skema database dan bangun Prisma Client
npx prisma generate
npx prisma db push

# 4. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## Perintah Tersedia

Didefinisikan di `package.json`:

| Perintah | Baris Perintah | Fungsi |
|---|---|---|
| `npm run dev` | `next dev` | Menjalankan server pengembangan lokal dengan engine Turbopack |
| `npm run build` | `prisma generate && next build` | Membangun Prisma Client dan mengompilasi build produksi Next.js |
| `npm run start` | `next start` | Menjalankan build produksi yang telah dikompilasi |
| `npm run lint` | `eslint` | Menjalankan inspeksi kualitas kode dengan ESLint |
| `npm run postinstall` | `prisma generate` | Otomatis me-regenerasi Prisma Client lokal setelah `npm install` |

---

## Daftar Rute Halaman

### Halaman Publik & Belanja

| Rute | Akses | Deskripsi |
|---|---|---|
| `/` | Publik | Halaman utama dengan hero section, produk digital unggulan, dan jaminan keamanan |
| `/products` | Publik | Katalog produk dengan filter kategori, pencarian, dan pengurutan harga |
| `/products/[slug]` | Publik | Detail produk lengkap dengan galeri pratinjau dan tombol tambah ke keranjang |
| `/cart` | Publik / Guest | Keranjang belanja dinamis terhubung ke sesi login atau cookie guest |
| `/checkout` | Publik / Guest | Halaman peninjauan pesanan sebelum kasir pembayaran diinisialisasi |

### Autentikasi

| Rute | Akses | Deskripsi |
|---|---|---|
| `/login` | Pengunjung | Masuk via Google OAuth atau Gmail/Password dengan proteksi Turnstile CAPTCHA |
| `/register` | Pengunjung | Pendaftaran akun baru yang dibatasi secara ketat khusus untuk domain `@gmail.com` |
| `/verify-otp` | User Belum Verifikasi | Input kode verifikasi email 6-digit yang dikirimkan via SMTP |

### Portal Pembeli

| Rute | Akses | Deskripsi |
|---|---|---|
| `/account` | Pembeli (`CUSTOMER`) | Beranda ringkasan akun pembeli |
| `/account/profile` | Pembeli (`CUSTOMER`) | Perbarui informasi profil pribadi dan unggah foto avatar |
| `/account/orders` | Pembeli (`CUSTOMER`) | Pantau riwayat transaksi faktur pesanan dan status pembayaran |
| `/account/downloads` | Pembeli (`CUSTOMER`) | Pusat unduhan file digital dengan pelacakan sisa kuota dan masa aktif |

### Portal Penjual & Administrator

| Rute | Akses | Deskripsi |
|---|---|---|
| `/become-seller` | Pengguna Terdaftar | Alur pendaftaran bagi akun pembeli yang ingin membuka etalase toko |
| `/admin` | `SELLER` / `ADMIN` | Dashboard operasional dengan grafik cashflow dan indikator penjualan |
| `/admin/products` | `SELLER` / `ADMIN` | Manajemen inventaris (terisolasi per penjual; admin melihat seluruh produk) |
| `/admin/products/new` | `SELLER` / `ADMIN` | Buat produk baru dan unggah aset file digital ke storage privat |
| `/admin/products/[id]` | `SELLER` / `ADMIN` | Ringkasan detail produk |
| `/admin/products/[id]/edit` | `SELLER` / `ADMIN` | Perbarui data produk, harga, dan kategori |
| `/admin/products/[id]/images` | `SELLER` / `ADMIN` | Kelola foto produk (verifikasi magic byte signature) |
| `/admin/products/[id]/assets` | `SELLER` / `ADMIN` | Kelola lampiran file digital yang dijual |
| `/admin/categories` | `SELLER` / `ADMIN` | Manajemen kategori produk pasar |
| `/admin/orders` | `SELLER` / `ADMIN` | Pengawasan pesanan masuk (terisolasi per penjual; admin melihat seluruh pesanan) |
| `/admin/audit-logs` | Super Admin (`ADMIN`) | Inspeksi log audit keamanan sistem (khusus role `ADMIN`) |

### Pesanan & Pembayaran

| Rute | Akses | Deskripsi |
|---|---|---|
| `/orders/[orderNumber]` | Pemilik Pesanan | Faktur rincian pesanan lengkap dengan aksi unduh jika pembayaran telah lunas |
| `/orders/[orderNumber]/pay` | Pemilik Pesanan | Antarmuka kasir pembayaran pop-up Midtrans Snap |

---

## Endpoint API & Server Actions

### Route Handlers

| Endpoint | Method | Otorisasi | Fungsi |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | Publik | Negosiasi sesi Auth.js, penanganan callback OAuth, dan signout |
| `/api/downloads/[grantId]` | `GET` | Sesi Pengguna | Mengalirkan file privat dengan memvalidasi masa aktif 48 jam dan kuota 5x |
| `/api/payments/midtrans` | `POST` | Webhook Midtrans | Memverifikasi tanda tangan SHA-512, memproses pembayaran, dan menerbitkan tiket unduh |
| `/api/product-images/[imageId]` | `GET` | Publik | Menyajikan gambar pratinjau produk dari storage cloud |
| `/api/profile-image` | `GET` | Terautentikasi | Menyajikan gambar avatar pengguna |

### Server Actions Kunci

| Server Action | Lokasi File | Akses | Mekanisme Keamanan |
|---|---|---|---|
| `registerAction` | `src/app/(auth)/actions.ts` | Publik | Validasi Zod, filter `@gmail.com`, Turnstile, Rate limit, pengiriman OTP |
| `loginAction` | `src/app/(auth)/actions.ts` | Publik | Validasi Zod, Turnstile, Rate limit, verifikasi kredensial Auth.js |
| `verifyOtpAction` | `src/app/(auth)/actions.ts` | Publik | Regex 6-digit, Rate limit (5x/10m), komparasi hash SHA-256, AuditLog |
| `resendOtpAction` | `src/app/(auth)/actions.ts` | Publik | Rate limit (3x/15m), regenerasi OTP kriptografis, pengiriman email SMTP |
| `addToCartAction` | `src/app/cart/actions.ts` | Publik / Guest | Validasi status produk aktif, upsert baris keranjang atomik |
| `createOrderAction` | `src/modules/orders/actions.ts` | User / Guest | `$transaction` atomik, hitung ulang harga dari DB, penerbitan Order |
| `createMidtransPaymentAction` | `src/modules/payments/actions.ts` | Pemilik Order | Validasi status pesanan, inisialisasi token pembayaran Snap |
| `uploadProductImageAction` | `src/modules/catalog/image-actions.ts` | Seller / Admin | Isolasi hak kepemilikan, cek magic byte signature, batas 5MB, upload Blob |
| `becomeSellerAction` | `src/app/become-seller/actions.ts` | Customer | Validasi Zod, promosi peran ke `SELLER`, pencatatan `AuditLog` |

---

## Alur Pembayaran & Pengiriman Digital

```text
[Pembeli / Guest] ──> Menambahkan Produk ke Keranjang Belanja
       │
       ▼
[Checkout (/checkout)] ──> Server Action membuat Pesanan via $transaction (Harga dikunci dari DB)
       │
       ▼
[API Midtrans Snap] ──> Mengembalikan Token Snap & URL Kasir Pembayaran
       │
       ▼
[Pembeli Membayar] ──> Virtual Account / QRIS / Kartu Kredit / Minimarket
       │
       ▼
[Webhook Midtrans (/api/payments/midtrans)]
       │
       ├── 1. Verifikasi Tanda Tangan SHA-512 (order_id + status_code + gross_amount + serverKey)
       ├── 2. Validasi Mata Uang (IDR) & Kesesuaian Nominal dengan order.totalMinor di DB
       ├── 3. Eksekusi $transaction Atomik:
       │      ├── Perbarui status Payment -> PAID
       │      ├── Perbarui status Order -> PAID
       │      ├── Konversi status Cart -> CONVERTED
       │      └── Simpan PaymentEvent (Idempoten via unique constraint gabungan)
       │
       └── 4. Jalankan createDownloadGrantsForPaidOrder:
              └── Terbitkan DownloadGrant (expiresAt = sekarang + 48 jam, downloadCount = 0)
                     │
                     ▼
[Pembeli Mengakses /account/downloads atau /orders/[orderNumber]]
       │
       ▼
[Permintaan Unduh File (/api/downloads/[grantId])]
       ├── Cek: session.user.id == grant.userId
       ├── Cek: order.paymentStatus == "PAID"
       ├── Cek: sekarang <= grant.expiresAt (Masa Aktif 48 Jam)
       ├── Cek: grant.downloadCount < 5 (Batas Maksimal Kuota)
       ├── Tambah hitungan downloadCount secara atomik (+1)
       └── Mengalirkan binary file langsung dari storage privat @vercel/blob
```

---

## Internasionalisasi

Marketplace memiliki arsitektur dwibahasa bawaan yang ringan:

1. Preferensi bahasa pengguna disimpan dalam HTTP cookie bernama `einc_locale` (disanitasi ketat hanya bernilai `id` atau `en`; default `en`).
2. Server Components membaca kamus bahasa (`id.ts` atau `en.ts`) langsung di sisi server via `getDictionary()`, tanpa membebani ukuran bundle JavaScript di peramban pengguna.
3. Komponen client membaca terjemahan menggunakan hook reaktif `useI18n()`.
4. Format mata uang menyesuaikan secara otomatis:
   - Bahasa Indonesia: `Rp 150.000` (`id-ID`)
   - Bahasa Inggris: `IDR 150,000` (`en-US`)

---

## Praktik Keamanan

### 1. Mata Uang Integer Minor Unit (Anti-Floating Point Bug)

- **Ancaman yang Dicegah**: Bug presisi floating-point JavaScript (mis. `0.1 + 0.2 = 0.30000000000000004`) yang menyebabkan selisih pembukuan dan penolakan transaksi oleh payment gateway.
- **Cara Kerja**: Semua nilai uang disimpan dan dikalkulasi dalam bilangan bulat terkecil (Rupiah satuan / `priceMinor`). Bayangkan seperti kasir yang menghitung koin fisik satu per satu, bukan menggunakan pecahan kertas desimal, sehingga tidak ada potensi selisih desimal.
- **Lokasi Implementasi**: `src/lib/format/currency.ts`, `prisma/schema.prisma`, `src/modules/orders/service.ts`.
- **Cara Memakai**: Selalu set nilai harga dengan integer `priceMinor: Math.round(nominalRupiah)` dan tampilkan via `formatIdr(amountMinor, locale)`.

### 2. Isolasi Tenant Multi-Seller & Pengecekan Sesi Live Database

- **Ancaman yang Dicegah**: Kebocoran data antar-toko dan eskalasi hak akses ilegal (mis. Penjual A memodifikasi produk Penjual B, atau pengguna yang telah di-suspend tetap bisa beroperasi menggunakan token JWT lama).
- **Cara Kerja**: Identitas penjual tidak pernah dipercayai dari input peramban. Guard `requireAdmin()` mengekstrak identitas dari sesi server dan menyisipkan filter `{ sellerId: admin.id }` untuk semua non-superadmin. Setiap request administratif mengecek status akun `ACTIVE` langsung ke PostgreSQL.
- **Lokasi Implementasi**: `src/lib/auth/require-user.ts`, `src/app/admin/products/page.tsx`, `src/modules/catalog/image-actions.ts`.
- **Cara Memakai**: Bungkus seluruh halaman administratif dengan `await requireAdmin()` atau `await requireSuperAdmin()`.

### 3. Tiket Unduh Berkuota & Berbatas Waktu (48 Jam / 5x)

- **Ancaman yang Dicegah**: Pembajakan aset digital, penyebaran tautan publik permanen, dan pencurian bandwidth server.
- **Cara Kerja**: File digital disimpan secara privat di `@vercel/blob` tanpa link publik abadi. Akses pengunduhan dialirkan melalui rute `/api/downloads/[grantId]` yang memverifikasi bahwa pesanan telah lunas, waktu sekarang belum melampaui `expiresAt` (**48 jam**), dan kuota unduh belum melampaui `MAX_DOWNLOAD_LIMIT` (**5 kali**).
- **Lokasi Implementasi**: `src/app/api/downloads/[grantId]/route.ts`, `src/modules/digital-delivery/service.ts`.
- **Cara Memakai**: Diterbitkan otomatis saat pembayaran lunas via fungsi `createDownloadGrantsForPaidOrder(orderId)`.

### 4. Proteksi Bot Cerdas Cloudflare Turnstile

- **Ancaman yang Dicegah**: Serangan brute-force otomatis, spamming formulir pendaftaran, dan credential stuffing oleh skrip bot.
- **Cara Kerja**: Formulir login dan register menampilkan widget Cloudflare Turnstile tanpa puzzle gambar menyulitkan. Token yang diterima divalidasi langsung di sisi server via API resmi Cloudflare (`https://challenges.cloudflare.com/turnstile/v0/siteverify`) sebelum kredensial akun diperiksa.
- **Lokasi Implementasi**: `src/components/ui/turnstile.tsx`, `src/lib/security/turnstile.ts`, `src/app/(auth)/actions.ts`.
- **Cara Memakai**: Pasang `<Turnstile />` di formulir client dan panggil `await verifyTurnstileToken(token, requestIp)` di dalam Server Action.

### 5. Filter Email Palsu & Verifikasi 6-Digit OTP Kriptografis

- **Ancaman yang Dicegah**: Pembuatan ribuan akun sampah menggunakan layanan email sekali pakai (*disposable/temp mail*) dan pemalsuan identitas.
- **Cara Kerja**: Validasi Zod membatasi pendaftaran hanya untuk alamat berakhiran `@gmail.com`. Akun yang baru didaftarkan wajib memasukkan kode OTP 6-digit yang dihasilkan melalui `randomInt`, di-hash dengan SHA-256 di database, dan dikirimkan via SMTP Gmail aman. Akun yang belum terverifikasi diblokir dari area akun.
- **Lokasi Implementasi**: `src/lib/validation/auth.ts`, `src/lib/security/otp.ts`, `src/lib/email/sender.ts`, `src/app/(auth)/verify-otp/`.
- **Cara Memakai**: Dijalankan otomatis di `registerAction` dan dilindungi oleh guard `requireUser()`.

### 6. Anti-Spoofing IP Edge & Deteksi Klien Riil

- **Ancaman yang Dicegah**: Penyerang memalsukan alamat IP melalui manipulasi header `X-Forwarded-For` untuk mengelabui sistem pembatas rate limit.
- **Cara Kerja**: Sistem membaca alamat IP dengan memprioritaskan header terenkripsi resmi `cf-connecting-ip` dari jaringan edge Cloudflare sebelum memeriksa header proxy sekunder.
- **Lokasi Implementasi**: `src/lib/security/request.ts`.
- **Cara Memakai**: Panggil `const clientIp = await getRequestIp();` di setiap server action dan pencatatan audit log.

### 7. Verifikasi Tanda Tangan Webhook SHA-512 & Idempotensi Mutlak

- **Ancaman yang Dicegah**: Serangan manipulasi notifikasi pembayaran fiktif dan pemrosesan ganda (*double grant*) akibat pengiriman ulang webhook jaringan.
- **Cara Kerja**: Payload webhook Midtrans diverifikasi dengan menghitung hash SHA-512 (`order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`) dan dibandingkan menggunakan `crypto.timingSafeEqual`. Pemrosesan dijalankan dalam `$transaction` yang mencatat `PaymentEvent` dengan constraint unik `@@unique([provider, providerEventId])`.
- **Lokasi Implementasi**: `src/app/api/payments/midtrans/route.ts`.
- **Cara Memakai**: Aktif secara otomatis pada endpoint `POST /api/payments/midtrans`.

### 8. Verifikasi Magic Byte Signature pada File Unggahan

- **Ancaman yang Dicegah**: Pengunggahan file berbahaya (seperti skrip executable atau web shell PHP) yang disamarkan dengan ekstensi gambar palsu.
- **Cara Kerja**: Server tidak memercayai ekstensi file atau header `Content-Type` dari peramban. Sistem membaca 12 byte awal file buffer untuk memvalidasi tanda tangan byte asli gambar (JPEG `0xFF 0xD8 0xFF`, PNG `0x89 0x50 0x4E 0x47`, WebP `RIFF...WEBP`) serta membatasi ukuran maksimal 5MB.
- **Lokasi Implementasi**: `src/lib/storage/product-image.ts`.
- **Cara Memakai**: Dijalankan secara otomatis di dalam `uploadProductImageAction`.

### 9. Pembatas Percobaan (Rate Limiting) dengan Hash SHA-256

- **Ancaman yang Dicegah**: Serangan tebak kata sandi (*brute-force*), enumerasi kode OTP, dan kelebihan beban server (*denial of service*).
- **Cara Kerja**: Setiap aksi autentikasi dibatasi oleh `consumeAuthRateLimit` yang mencatat percobaan ke tabel PostgreSQL. Kunci identifier di-hash dengan SHA-256 sehingga alamat IP dan email pengguna tidak tersimpan dalam bentuk teks polos. Data kedaluwarsa dibersihkan otomatis secara probabilistik (peluang 5% per request).
- **Lokasi Implementasi**: `src/lib/security/rate-limit.ts`.
- **Cara Memakai**: Panggil `await consumeAuthRateLimit(key, options)` sebelum mengeksekusi logika autentikasi sensitif.

### 10. Header Keamanan HTTP & Konfigurasi Hardened

- **Ancaman yang Dicegah**: Serangan Cross-Site Scripting (XSS), Clickjacking, pembajakan iframe, MIME sniffing, dan downgrade SSL.
- **Cara Kerja**: File `next.config.ts` menyuntikkan header keamanan secara global ke seluruh respons HTTP: HSTS durasi 2 tahun (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, dan `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Header identitas `x-powered-by` dimatikan secara permanen.
- **Lokasi Implementasi**: `next.config.ts`.
- **Cara Memakai**: Diterapkan secara otomatis oleh server Next.js pada setiap respons halaman dan API.

---

## License

### EINCSHOP — Proprietary License

Copyright © 2026 EINCSHOP. All Rights Reserved.

The source code in this repository is provided for viewing and reference purposes only.

No permission is granted to copy, modify, redistribute, sublicense, or use this code for commercial or public deployment without prior written permission from the copyright holder.

All rights are reserved except where otherwise permitted by applicable law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
