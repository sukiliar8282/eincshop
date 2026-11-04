# EINCSHOP — Enterprise Multi-Seller Digital Marketplace

EINCSHOP is a digital marketplace built with Next.js 16.4.3 (App Router), React 19.2.8, TypeScript 5, Tailwind CSS v4, Prisma ORM 7.10.1, PostgreSQL (Supabase), Auth.js v5 Beta, Cloudflare Turnstile, and Midtrans Payment Gateway.

The platform works much like an online shopping mall. Each seller manages a separate storefront, while buyers can browse products, place orders, and pay through an automated checkout. Once payment is confirmed, buyers receive controlled access to the digital files they purchased. Sellers cannot access another seller's inventory or sales records through the platform's intended access boundaries.

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
| **Language** | TypeScript | `^5.0.0` | Static type safety across the application |
| **Styling** | Tailwind CSS & PostCSS Plugin | `^4.0.0` | Design tokens and CSS custom properties |
| **Database & ORM** | Prisma Client & CLI | `^7.10.1` | Object-relational mapping and schema migration |
| **DB Driver** | PostgreSQL (`pg` + `@prisma/adapter-pg`) | `^8.23.0` | Connection pooling with Supabase |
| **Cloud Storage** | `@vercel/blob` | `^2.8.0` | Private storage for digital downloads and product images |
| **Authentication** | Auth.js (`next-auth`) | `^5.0.0-beta.32` | JWT session management and Google OAuth |
| **Password Hashing** | `bcryptjs` | `^3.0.3` | Password salting and hashing with cost factor 12 |
| **Mailing Service** | `nodemailer` | `^8.0.11` | Automated delivery of 6-digit email OTPs through SMTP |
| **Bot Defense** | Cloudflare Turnstile | Server API | Managed CAPTCHA for registration and authentication |
| **Payment Gateway** | Midtrans Core Snap API | Sandbox / Prod | Embedded Snap checkout and SHA-512-signed webhooks |
| **Schema Validation** | Zod | `^4.6.5` | Type-safe form validation and input sanitization |
| **Hosting & CI/CD** | Vercel Serverless Platform | Production | Automated integration and deployments |

---

## Features

### For Buyers (Customers)

- **Product Catalog** — Browse and search digital products using category filters, keyword search, price or date sorting, and grid or list views.
- **Guest-Friendly Cart** — Keep shopping items in a persistent cart across page refreshes through the `einc_guest_id` cookie, without requiring an account at the start.
- **Dedicated Checkout** — Review an order on `/checkout`. Product availability is checked, and prices are retrieved from current database records.
- **Automated Payments** — Midtrans Snap supports Virtual Accounts, QRIS (GoPay, OVO, ShopeePay), credit cards, and convenience-store payments.
- **Expiring, Quota-Limited Downloads** — Paid purchases receive cryptographic `DownloadGrant` records. Each download grant expires after **48 hours** and allows a maximum of **5 downloads** per asset.
- **Order History and Invoices** — Track order statuses (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`) and view itemized invoices.
- **Profile Management** — Update account details, change names, and upload profile avatars.
- **Bilingual Storefront** — Use the marketplace in English or Indonesian, with automatic browser-locale detection.

### For Sellers

- **Seller Onboarding** — Existing customer accounts can apply to manage a storefront through `/become-seller`.
- **Product Management** — Create, edit, publish, or archive digital products. Sellers can upload preview images validated through magic-byte signatures, set integer IDR prices, assign categories, and attach downloadable files.
- **Financial Analytics** — Review sales performance through an interactive dashboard showing Revenue, Platform Expense, and Net Profit, along with key performance indicators and the automatic 3% platform commission (`AUTO_FEE_RATE = 0.03`).
- **Store Order Tracking** — View incoming orders associated with products owned by the authenticated seller.
- **Category Management** — Create and organize product categories for the storefront.

### For Administrators

- **Platform-Wide Management** — Manage platform products, categories, transactions, and store operations from a centralized interface.
- **Security Audit Trail** — `AuditLog` records capture the actor ID, event name, target entity, timestamp, and source IP address to support security reviews.
- **Live Database Permission Checks** — Protected routes using `requireSuperAdmin` check account privileges directly against PostgreSQL on every request, rather than relying solely on potentially outdated JWT claims.

### Platform-Wide

- **Cloudflare Turnstile** — Provides bot protection in authentication forms, with verification enforced at the Server Action layer.
- **Gmail-Only Registration** — Zod schemas and Google OAuth profile checks restrict registration to `@gmail.com` accounts.
- **Client IP Resolution** — The application prioritizes Cloudflare's `cf-connecting-ip` header when resolving the client IP address.
- **Integer-Based Currency** — Financial values use integer Rupiah units (`priceMinor`) to avoid IEEE-754 floating-point rounding errors.
- **Automated Deployment** — Vercel deployments support automated releases, rollbacks, and live database health checks.

---

## Database Architecture

The application uses PostgreSQL with Prisma ORM 7 and connection pooling.

| Model | Table Name | Purpose | Key Attributes & Constraints |
|---|---|---|---|
| `User` | `users` | Account identity and profile | Role (`CUSTOMER`, `SELLER`, `ADMIN`), status (`ACTIVE`, `SUSPENDED`), `storeName` |
| `Account` | `accounts` | OAuth provider credentials | Composite unique index on `[provider, providerAccountId]` |
| `Session` | `sessions` | Server-side authentication sessions | Unique `sessionToken`, expiration timestamp |
| `Product` | `products` | Digital catalog entries | Integer price (`priceMinor`), status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `sellerId` relation |
| `Category` | `categories` | Product classification | Unique `slug`, `isActive` index |
| `Cart` | `carts` | User shopping carts | Status (`ACTIVE`, `CONVERTED`, `ABANDONED`), compound index on `[userId, status]` |
| `CartItem` | `cart_items` | Items in shopping carts | Composite unique constraint on `[cartId, productId]` |
| `Order` | `orders` | Sales invoices | Unique `orderNumber`, status (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`), `totalMinor` |
| `OrderItem` | `order_items` | Fixed order line items | Stores `productTitle` and `unitPriceMinor`, with a reference to `Product` |
| `Payment` | `payments` | Payment transaction records | References `Order`; tracks provider (`MIDTRANS`, `DUMMY`) and payment status |
| `PaymentAttempt` | `payment_attempts` | Individual payment attempts | Unique `idempotencyKey`, provider reference ID |
| `PaymentEvent` | `payment_events` | Webhook event records | Composite unique constraint on `[provider, providerEventId]` for idempotency |
| `DigitalAsset` | `digital_assets` | Cloud storage references | `@vercel/blob` storage key, file name, byte size, MIME type |
| `DownloadGrant` | `download_grants` | Controlled download access | Bound to `[orderItemId, digitalAssetId]`, `expiresAt` (48h), `downloadCount` (maximum 5) |
| `AuditLog` | `audit_logs` | Security activity records | Actor reference, action name, target entity ID, IP address, metadata JSON |
| `AuthRateLimit` | `auth_rate_limits` | Brute-force protection | SHA-256-hashed primary key (`key`), attempt count, `blockedUntil` timestamp |
| `VerificationToken` | `verification_tokens` | Email OTP storage | Composite identifier `[identifier, token]`, 10-minute expiry |

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
│   │   │   ├── auth-form.tsx  # Login/Register UI with Google OAuth and Turnstile
│   │   │   ├── login/         # Customer and seller login page
│   │   │   ├── register/      # New account registration page
│   │   │   └── verify-otp/    # 6-digit email OTP verification form
│   │   ├── account/           # Customer portal (protected by requireUser)
│   │   │   ├── page.tsx       # Account dashboard
│   │   │   ├── profile/       # Profile management and avatar upload
│   │   │   ├── orders/        # Customer order history
│   │   │   └── downloads/     # Download center with quota tracking
│   │   ├── admin/             # Seller and admin portal (protected by requireAdmin)
│   │   │   ├── page.tsx       # Financial analytics dashboard and cashflow charts
│   │   │   ├── audit-logs/    # Security activity inspection (requireSuperAdmin)
│   │   │   ├── categories/    # Category management
│   │   │   ├── orders/        # Platform-wide and store-specific orders
│   │   │   └── products/      # Product inventory, images, and digital assets
│   │   ├── become-seller/     # Seller onboarding workflow
│   │   ├── cart/              # Persistent cart and quantity adjustment
│   │   ├── checkout/          # Order review and initialization
│   │   ├── orders/            # Order invoices and status summaries
│   │   │   └── [orderNumber]/ # Invoice details and payment action
│   │   │       └── pay/       # Embedded Midtrans Snap checkout
│   │   ├── products/          # Public catalog and localized product pages
│   │   │   └── [slug]/        # Individual product view
│   │   └── api/               # Serverless Route Handlers
│   │       ├── auth/          # NextAuth route handler ([...nextauth])
│   │       ├── downloads/     # Quota- and expiry-protected file streaming ([grantId])
│   │       ├── payments/      # Midtrans SHA-512 webhook verification
│   │       ├── product-images/# Product preview image proxy
│   │       └── profile-image/ # User avatar streaming endpoint
│   ├── components/
│   │   ├── admin/             # FinancialChart, DeleteProductButton
│   │   ├── cart/              # AddToCartForm, CartItemList
│   │   ├── checkout/          # CheckoutForm
│   │   ├── layout/            # SiteHeader, MobileNav, SiteFooter, AccountMenu
│   │   ├── order/             # Order status badges and summaries
│   │   ├── payment/           # MidtransSnapPayment, PayOrderButton
│   │   ├── product/           # ProductCard, CatalogControls, Pagination
│   │   └── ui/                # Button, Container, Turnstile, LoadingButton, Modal
│   ├── lib/
│   │   ├── admin/             # financial-analytics.ts, seller-metrics.ts
│   │   ├── auth/              # requireUser, requireAdmin, requireSuperAdmin, guest cookies
│   │   ├── auth.ts            # Auth.js configuration, callbacks, credentials provider
│   │   ├── db.ts              # PrismaClient singleton with PostgreSQL pool adapter
│   │   ├── email/             # sender.ts (Nodemailer Gmail SMTP with terminal fallback)
│   │   ├── format/            # currency.ts (formatIdr with integer currency calculations)
│   │   ├── i18n/              # config.ts, server.ts, client.ts, dictionaries (en, id)
│   │   ├── security/          # turnstile.ts, password.ts, rate-limit.ts, request.ts, otp.ts, audit.ts
│   │   ├── storage/           # product-image.ts (magic-byte image validation)
│   │   └── validation/        # auth.ts, catalog.ts (Zod validation schemas)
│   └── generated/
│       └── prisma/            # Local type-safe Prisma Client output
├── next.config.ts             # Security headers, Server Action limits, dev origins
├── package.json               # Dependencies and maintenance scripts
└── tsconfig.json              # TypeScript compiler settings and path aliases
```

---

## Environment Variables

Configure environment variables in your hosting provider, such as Vercel Project Settings, or in your local `.env` file.

| Variable Name | Required | Category | Description | Example Placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | **Yes** | Database | PostgreSQL connection string with pooling parameters | `postgresql://user:password@host:5432/db?sslmode=require` |
| `AUTH_SECRET` | **Yes** | Security | Secret used to encrypt Auth.js session JWTs | `generate-random-32-chars-string` |
| `AUTH_GOOGLE_ID` | Optional | Auth | Google Cloud OAuth Client ID for one-click login | `your-google-client-id.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Optional | Auth | Google Cloud OAuth Client Secret | `GOCSPX-yourGoogleClientSecret` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | **Yes** | Payments | Midtrans Client Key used to render Snap checkout | `Mid-client-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_SERVER_KEY` | **Yes** | Payments | Midtrans Server Key for Snap API requests and webhook signatures | `Mid-server-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_IS_PRODUCTION` | Optional | Payments | Selects Midtrans Production or Sandbox endpoints | `false` (default) or `true` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Yes** | Security | Public Cloudflare Turnstile site key for the frontend widget | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `TURNSTILE_SECRET_KEY` | **Yes** | Security | Private Cloudflare Turnstile key for server-side verification | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `BLOB_READ_WRITE_TOKEN` | **Yes** | Storage | Access token for private `@vercel/blob` storage | `vercel_blob_rw_xxxxxxxxxxxx` |
| `SMTP_USER` | Optional | Email | Gmail or custom SMTP address used to send OTP codes | `your-service@gmail.com` |
| `SMTP_PASS` | Optional | Email | SMTP App Password (16 characters; spaces are stripped automatically) | `abcd efgh ijkl mnop` |
| `PAYMENT_PROVIDER` | Optional | Payments | Testing switch; use `dummy` only outside production | `midtrans` (default) |
| `NEXT_PUBLIC_APP_URL` | Optional | App | Canonical base URL for the application | `http://localhost:3000` |
| `NODE_ENV` | Optional | Runtime | Node.js execution environment | `development` or `production` |

---

## Getting Started

### Prerequisites

Before running the project, make sure you have:

- Node.js **20.x** or **22.x LTS**
- A running PostgreSQL database, such as Supabase, Neon, or local PostgreSQL 15+
- Cloudflare Turnstile Site and Secret Keys
- A Midtrans Merchant Account in Sandbox or Production mode

### Installation

```bash
# 1. Clone the repository and enter the project directory
git clone https://github.com/sukiliar8282/eincshop.git
cd eincshop

# 2. Install dependencies
npm install

# 3. Generate Prisma Client and synchronize the database schema
npx prisma generate
npx prisma db push

# 4. Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

The following scripts are defined in `package.json`:

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Starts the local Next.js development server with Turbopack |
| `npm run build` | `prisma generate && next build` | Generates Prisma Client and builds the optimized production application |
| `npm run start` | `next start` | Runs the compiled production build |
| `npm run lint` | `eslint` | Runs ESLint code-quality checks |
| `npm run postinstall` | `prisma generate` | Generates the local Prisma Client after `npm install` |

---

## Available Routes

### Public Storefront

| Route | Access | Description |
|---|---|---|
| `/` | Public | Homepage featuring selected digital products and trust badges |
| `/products` | Public | Product catalog with category filters, keyword search, and sorting |
| `/products/[slug]` | Public | Product details and image previews |
| `/cart` | Public / Guest | Shopping cart connected to an authenticated or guest session |
| `/checkout` | Public / Guest | Order review and confirmation before payment |

### Authentication

| Route | Access | Description |
|---|---|---|
| `/login` | Anonymous | Sign in with Google OAuth or Gmail/password, protected by Turnstile CAPTCHA |
| `/register` | Anonymous | Create an account using an `@gmail.com` address |
| `/verify-otp` | Unverified User | Enter the 6-digit email verification code sent through SMTP |

### Buyer Portal

| Route | Access | Description |
|---|---|---|
| `/account` | Buyer (`CUSTOMER`) | Buyer account overview |
| `/account/profile` | Buyer (`CUSTOMER`) | Update profile information and upload an avatar |
| `/account/orders` | Buyer (`CUSTOMER`) | View order invoices and payment statuses |
| `/account/downloads` | Buyer (`CUSTOMER`) | View active download grants, expiration dates, and remaining quotas |

### Seller & Administrator Portal

| Route | Access | Description |
|---|---|---|
| `/become-seller` | Authenticated User | Apply to open a seller storefront |
| `/admin` | `SELLER` / `ADMIN` | Operations dashboard with cashflow charts and metrics |
| `/admin/products` | `SELLER` / `ADMIN` | Product inventory management, isolated by seller; admins can view all products |
| `/admin/products/new` | `SELLER` / `ADMIN` | Create a product and upload its digital asset |
| `/admin/products/[id]` | `SELLER` / `ADMIN` | Product details |
| `/admin/products/[id]/edit` | `SELLER` / `ADMIN` | Edit product information, pricing, and category |
| `/admin/products/[id]/images` | `SELLER` / `ADMIN` | Manage product images with magic-byte validation |
| `/admin/products/[id]/assets` | `SELLER` / `ADMIN` | Manage downloadable digital files |
| `/admin/categories` | `SELLER` / `ADMIN` | Create and manage product categories |
| `/admin/orders` | `SELLER` / `ADMIN` | Incoming orders filtered by seller; admins can view all orders |
| `/admin/audit-logs` | Super Admin (`ADMIN`) | Review system security logs; access is restricted to `ADMIN` |

### Orders & Payment

| Route | Access | Description |
|---|---|---|
| `/orders/[orderNumber]` | Order Owner | Itemized invoice and download action for paid orders |
| `/orders/[orderNumber]/pay` | Order Owner | Opens the embedded Midtrans Snap checkout |

---

## API Endpoints & Server Actions

### Route Handlers

| Endpoint | Method | Authorization | Purpose |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | Public | Auth.js session handling, OAuth callbacks, and sign-out |
| `/api/downloads/[grantId]` | `GET` | Session User | Streams digital files after checking the 48-hour expiry and 5-download limit |
| `/api/payments/midtrans` | `POST` | Midtrans Webhook | Verifies the SHA-512 signature, processes payments, and creates download grants |
| `/api/product-images/[imageId]` | `GET` | Public | Serves product preview images from storage |
| `/api/profile-image` | `GET` | Authenticated | Serves the user's profile avatar |

### Key Server Actions

| Server Action | Defined In | Access | Security Controls |
|---|---|---|---|
| `registerAction` | `src/app/(auth)/actions.ts` | Public | Zod validation, `@gmail.com` enforcement, Turnstile, rate limiting |
| `loginAction` | `src/app/(auth)/actions.ts` | Public | Zod validation, Turnstile, rate limiting, Auth.js credential verification |
| `verifyOtpAction` | `src/app/(auth)/actions.ts` | Public | 6-digit regex, rate limit (5 attempts/10m), SHA-256 comparison, AuditLog |
| `resendOtpAction` | `src/app/(auth)/actions.ts` | Public | Rate limit (3 attempts/15m), cryptographic OTP regeneration, Nodemailer |
| `addToCartAction` | `src/app/cart/actions.ts` | Public / Guest | Live stock check and atomic cart-item upsert |
| `createOrderAction` | `src/modules/orders/actions.ts` | User / Guest | Atomic `$transaction`, database-based price recalculation, order creation |
| `createMidtransPaymentAction` | `src/modules/payments/actions.ts` | Order Owner | Order-status validation and Midtrans Snap token generation |
| `uploadProductImageAction` | `src/modules/catalog/image-actions.ts` | Seller / Admin | Ownership checks, magic-byte validation, 5MB limit, Blob upload |
| `becomeSellerAction` | `src/app/become-seller/actions.ts` | Customer | Zod validation, role promotion to `SELLER`, AuditLog entry |

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

EINCSHOP supports both Indonesian and English through a built-in localization system.

1. The user's language preference is stored in the `einc_locale` HTTP cookie. Its value is sanitized to either `id` or `en`, with `en` as the default.
2. Server Components load the appropriate dictionary (`id.ts` or `en.ts`) through `getDictionary()`. This keeps dictionary data out of the client-side JavaScript bundle.
3. Client components access translations through the reactive `useI18n()` hook.
4. Currency formatting follows the selected locale:
   - Indonesian: `Rp 150.000` (`id-ID`)
   - English: `IDR 150,000` (`en-US`)

---

## Security Practices

### 1. Integer-Based Currency

- **Threat addressed:** Floating-point rounding errors, such as `0.1 + 0.2 = 0.30000000000000004`, which can lead to accounting discrepancies or payment-gateway rejections.
- **How it works:** Product prices, line totals, and order subtotals are stored and processed as integers representing individual Rupiah units (`priceMinor`). This avoids calculations based on fractional currency values.
- **Implementation:** `src/lib/format/currency.ts`, `prisma/schema.prisma`, `src/modules/orders/service.ts`.
- **Usage:** Set prices using `priceMinor: Math.round(priceInRupiah)` and format them with `formatIdr(amountMinor, locale)`.

### 2. Multi-Tenant Seller Isolation & Live Database Permission Checks

- **Threat addressed:** Cross-seller data exposure and unauthorized privilege escalation, such as one seller accessing or deleting another seller's products, or a suspended account continuing to operate with an outdated JWT.
- **How it works:** Seller identity is not taken from client-submitted data. `requireAdmin()` derives the authenticated user ID and applies `{ sellerId: admin.id }` to queries for non-superadmin users. Administrative requests also check the account's `ACTIVE` status directly in PostgreSQL.
- **Implementation:** `src/lib/auth/require-user.ts`, `src/app/admin/products/page.tsx`, `src/modules/catalog/image-actions.ts`.
- **Usage:** Protect administrative pages with `await requireAdmin()` or `await requireSuperAdmin()`.

### 3. Expiring, Quota-Limited Download Grants

- **Threat addressed:** Unauthorized redistribution, permanent download-link exposure, and excessive bandwidth usage.
- **How it works:** Downloadable files remain in private `@vercel/blob` storage rather than being exposed through permanent public URLs. The `/api/downloads/[grantId]` route checks payment status, verifies that the grant has not expired (**48 hours**), and enforces the `MAX_DOWNLOAD_LIMIT` of **5 downloads**.
- **Implementation:** `src/app/api/downloads/[grantId]/route.ts`, `src/modules/digital-delivery/service.ts`.
- **Usage:** Grants are created automatically after payment settlement through `createDownloadGrantsForPaidOrder(orderId)`.

### 4. Cloudflare Turnstile Bot Defense

- **Threat addressed:** Automated account creation, credential stuffing, and spam targeting authentication endpoints.
- **How it works:** Login and registration forms include a Turnstile widget. The submitted token is verified server-side through Cloudflare's API at `https://challenges.cloudflare.com/turnstile/v0/siteverify` before credentials are processed.
- **Implementation:** `src/components/ui/turnstile.tsx`, `src/lib/security/turnstile.ts`, `src/app/(auth)/actions.ts`.
- **Usage:** Add `<Turnstile />` to forms and call `await verifyTurnstileToken(token, requestIp)` in Server Actions.

### 5. Gmail-Only Registration & 6-Digit Cryptographic OTP

- **Threat addressed:** Disposable-email registrations, automated account creation, and unverified accounts.
- **How it works:** Zod validation restricts registration to `@gmail.com` addresses. New accounts must verify a 6-digit OTP generated with `randomInt`, hashed with SHA-256 in the database, and sent through Gmail SMTP. Unverified accounts cannot access buyer or seller areas.
- **Implementation:** `src/lib/validation/auth.ts`, `src/lib/security/otp.ts`, `src/lib/email/sender.ts`, `src/app/(auth)/verify-otp/`.
- **Usage:** Registration verification is handled by `registerAction` and enforced through `requireUser()`.

### 6. Client IP Resolution & Edge Header Protection

- **Threat addressed:** Rate-limit bypass and IP spoofing through forged `X-Forwarded-For` headers.
- **How it works:** The application resolves the client IP using a strict header priority, favoring Cloudflare's `cf-connecting-ip` header over standard proxy headers.
- **Implementation:** `src/lib/security/request.ts`.
- **Usage:** Call `const clientIp = await getRequestIp();` in Server Actions and audit logging.

### 7. SHA-512 Webhook Verification & Idempotent Event Processing

- **Threat addressed:** Forged payment notifications and duplicate order processing caused by repeated webhook deliveries.
- **How it works:** Midtrans webhook payloads are verified by hashing `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY` with SHA-512. The result is compared using `crypto.timingSafeEqual`. Processing runs inside an atomic `$transaction`, while the `PaymentEvent` record uses `@@unique([provider, providerEventId])` to prevent duplicate event processing.
- **Implementation:** `src/app/api/payments/midtrans/route.ts`.
- **Usage:** Applied automatically to `POST /api/payments/midtrans`.

### 8. Magic-Byte Image Validation

- **Threat addressed:** Malicious files disguised as images by changing their file extensions, such as executable scripts renamed to `.jpg`.
- **How it works:** The server does not rely solely on the uploaded MIME type or extension. It checks the first 12 bytes of the file buffer against supported image signatures: JPEG (`0xFF 0xD8 0xFF`), PNG (`0x89 0x50 0x4E 0x47`), and WebP (`RIFF...WEBP`). Uploads are limited to 5MB.
- **Implementation:** `src/lib/storage/product-image.ts`.
- **Usage:** Applied inside `uploadProductImageAction`.

### 9. Database-Backed Rate Limiting with SHA-256

- **Threat addressed:** Password brute-force attempts, OTP enumeration, and resource exhaustion.
- **How it works:** `consumeAuthRateLimit` tracks authentication attempts in PostgreSQL. The identifier is hashed with SHA-256 before storage, so client IP addresses and email addresses are not stored as plaintext. Expired records are cleaned up probabilistically, with a 5% chance per request.
- **Implementation:** `src/lib/security/rate-limit.ts`.
- **Usage:** Call `await consumeAuthRateLimit(key, options)` before processing sensitive actions.

### 10. HTTP Security Headers & Hardened Defaults

- **Threat addressed:** Cross-Site Scripting (XSS), clickjacking, MIME sniffing, and SSL-stripping attacks.
- **How it works:** `next.config.ts` applies security headers to HTTP responses: HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Cross-Origin-Opener-Policy: same-origin-allow-popups`. The `poweredByHeader` setting is disabled.
- **Implementation:** `next.config.ts`.
- **Usage:** These headers are applied automatically to outgoing HTTP responses.

---

## License

### EINCSHOP — Proprietary License

Copyright © 2026 EINCSHOP. All Rights Reserved.

The source code in this repository is available for viewing and reference purposes only.

Copying, modifying, redistributing, sublicensing, or using this code for commercial or public deployment requires prior written permission from the copyright holder.

All rights are reserved except where applicable law states otherwise.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
# EINCSHOP — Marketplace Aset Digital Multi-Seller

EINCSHOP adalah platform marketplace aset digital yang dibangun menggunakan Next.js 16.4.3 (App Router), React 19.2.8, TypeScript 5, Tailwind CSS v4, Prisma ORM 7.10.1, PostgreSQL (Supabase), Auth.js v5 Beta, Cloudflare Turnstile, dan Midtrans Payment Gateway.

Platform ini bekerja seperti pusat perbelanjaan digital. Setiap penjual memiliki etalase sendiri, sedangkan pembeli dapat menjelajahi katalog, memilih produk, dan membayar melalui proses checkout otomatis. Setelah pembayaran dikonfirmasi, pembeli memperoleh akses unduh ke file yang dibeli. Sistem dirancang agar data produk dan transaksi setiap penjual tetap terpisah sesuai dengan batas hak aksesnya.

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
| **Library UI** | React & React DOM | `19.2.8` | Hidrasi client, UI optimistik, dan reactive state hooks |
| **Bahasa Pemrograman** | TypeScript | `^5.0.0` | Pemeriksaan tipe statis di seluruh aplikasi |
| **Styling** | Tailwind CSS & PostCSS Plugin | `^4.0.0` | Sistem design token dan CSS custom properties |
| **Database & ORM** | Prisma Client & CLI | `^7.10.1` | Object-relational mapping dan migrasi skema |
| **Driver Database** | PostgreSQL (`pg` + `@prisma/adapter-pg`) | `^8.23.0` | Connection pooling dengan Supabase |
| **Penyimpanan Cloud** | `@vercel/blob` | `^2.8.0` | Penyimpanan privat untuk unduhan digital dan gambar produk |
| **Autentikasi** | Auth.js (`next-auth`) | `^5.0.0-beta.32` | Manajemen sesi JWT dan Google OAuth |
| **Hashing Password** | `bcryptjs` | `^3.0.3` | Salting dan hashing password dengan cost factor 12 |
| **Layanan Email** | `nodemailer` | `^8.0.11` | Pengiriman kode OTP 6 digit melalui SMTP |
| **Proteksi Bot** | Cloudflare Turnstile | Server API | CAPTCHA terkelola untuk registrasi dan autentikasi |
| **Payment Gateway** | Midtrans Core Snap API | Sandbox / Prod | Checkout Snap terintegrasi dan webhook bertanda tangan SHA-512 |
| **Validasi Skema** | Zod | `^4.6.5` | Validasi formulir berbasis tipe dan sanitasi input |
| **Hosting & CI/CD** | Vercel Serverless Platform | Production | Integrasi otomatis dan deployment aplikasi |

---

## Fitur-Fitur

### Untuk Pembeli (Customer)

- **Katalog Produk Digital** — Pembeli dapat menjelajahi dan mencari produk menggunakan filter kategori, pencarian kata kunci, pengurutan berdasarkan harga atau tanggal, serta pilihan tampilan grid dan list.
- **Keranjang untuk Guest** — Produk tetap tersimpan di keranjang meskipun halaman di-refresh. Sistem menggunakan cookie `einc_guest_id`, sehingga pembeli tidak harus login sejak awal.
- **Halaman Checkout Khusus** — Halaman `/checkout` digunakan untuk meninjau pesanan. Sistem memeriksa ketersediaan produk dan mengambil harga terbaru dari database.
- **Pembayaran Otomatis** — Integrasi Midtrans Snap mendukung Virtual Account, QRIS (GoPay, OVO, ShopeePay), kartu kredit, dan pembayaran melalui minimarket.
- **Unduhan dengan Batas Waktu dan Kuota** — Setelah pembayaran lunas, sistem membuat catatan `DownloadGrant` untuk mengatur akses file. Setiap grant berlaku selama **48 jam** dengan batas maksimal **5 kali unduhan** per aset.
- **Riwayat Pesanan dan Faktur** — Pembeli dapat memantau status pesanan (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`) dan melihat rincian transaksi.
- **Pengelolaan Profil** — Pengguna dapat memperbarui informasi akun, mengganti nama, dan mengunggah avatar.
- **Antarmuka Dwibahasa** — Marketplace mendukung Bahasa Indonesia dan Bahasa Inggris, termasuk deteksi bahasa peramban secara otomatis.

### Untuk Penjual (Seller)

- **Pendaftaran Penjual** — Pengguna yang sudah memiliki akun dapat mengajukan diri untuk mengelola toko melalui `/become-seller`.
- **Manajemen Produk** — Penjual dapat membuat, mengedit, menerbitkan, atau mengarsipkan produk digital. Fitur ini mencakup unggahan gambar pratinjau yang diperiksa melalui magic-byte signature, pengaturan harga integer dalam Rupiah, pemilihan kategori, dan lampiran file digital.
- **Analitik Keuangan** — Dashboard menampilkan grafik interaktif untuk Pendapatan Kotor, Biaya Platform, dan Pendapatan Bersih. Tersedia juga indikator performa utama serta perhitungan komisi platform otomatis sebesar 3% (`AUTO_FEE_RATE = 0.03`).
- **Pemantauan Pesanan Toko** — Penjual dapat melihat pesanan masuk yang berkaitan dengan produk miliknya.
- **Manajemen Kategori** — Penjual dapat membuat dan mengatur kategori produk di tokonya.

### Untuk Administrator

- **Pengelolaan Seluruh Platform** — Administrator dapat mengelola produk, kategori, transaksi, dan operasional toko melalui satu area terpusat.
- **Jejak Audit Keamanan** — `AuditLog` menyimpan ID aktor, nama peristiwa, entitas target, waktu kejadian, dan alamat IP sumber untuk membantu pemeriksaan aktivitas.
- **Pemeriksaan Hak Akses Langsung ke Database** — Rute yang menggunakan `requireSuperAdmin` memeriksa hak akses langsung ke PostgreSQL pada setiap request. Dengan begitu, sistem tidak hanya mengandalkan klaim JWT yang mungkin sudah tidak sesuai dengan kondisi akun terbaru.

### Fitur untuk Seluruh Platform

- **Cloudflare Turnstile** — Melindungi formulir autentikasi dari bot. Pemeriksaan token juga dilakukan di lapisan Server Action.
- **Pembatasan Email Gmail** — Skema Zod dan pemeriksaan profil Google OAuth membatasi pendaftaran ke alamat `@gmail.com`.
- **Resolusi IP Pengguna** — Sistem memprioritaskan header `cf-connecting-ip` milik Cloudflare saat menentukan alamat IP klien.
- **Perhitungan Uang Berbasis Integer** — Nilai keuangan disimpan sebagai bilangan bulat Rupiah (`priceMinor`) untuk menghindari kesalahan pembulatan floating-point IEEE-754.
- **Deployment Otomatis** — Deployment Vercel mendukung perilisan otomatis, rollback, dan pemeriksaan kesehatan database.

---

## Arsitektur Database

Aplikasi menggunakan PostgreSQL yang dikelola melalui Prisma ORM 7 dengan connection pooling.

| Model | Nama Tabel | Fungsi | Atribut & Constraint Kunci |
|---|---|---|---|
| `User` | `users` | Identitas akun dan profil | Peran (`CUSTOMER`, `SELLER`, `ADMIN`), status (`ACTIVE`, `SUSPENDED`), `storeName` |
| `Account` | `accounts` | Kredensial provider OAuth | Indeks unik gabungan `[provider, providerAccountId]` |
| `Session` | `sessions` | Sesi autentikasi server | `sessionToken` unik dan waktu kedaluwarsa |
| `Product` | `products` | Katalog produk digital | Harga integer (`priceMinor`), status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), relasi `sellerId` |
| `Category` | `categories` | Klasifikasi produk | `slug` unik dan indeks `isActive` |
| `Cart` | `carts` | Keranjang belanja pengguna | Status (`ACTIVE`, `CONVERTED`, `ABANDONED`), indeks gabungan `[userId, status]` |
| `CartItem` | `cart_items` | Item dalam keranjang | Constraint unik gabungan `[cartId, productId]` |
| `Order` | `orders` | Faktur transaksi penjualan | `orderNumber` unik, status (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`), `totalMinor` |
| `OrderItem` | `order_items` | Rincian item pesanan yang dikunci | Menyimpan `productTitle` dan `unitPriceMinor`, serta referensi ke `Product` |
| `Payment` | `payments` | Catatan transaksi pembayaran | Referensi ke `Order`, provider (`MIDTRANS`, `DUMMY`), dan status pembayaran |
| `PaymentAttempt` | `payment_attempts` | Catatan setiap percobaan pembayaran | `idempotencyKey` unik dan ID referensi provider |
| `PaymentEvent` | `payment_events` | Catatan peristiwa webhook | Constraint unik gabungan `[provider, providerEventId]` untuk idempotensi |
| `DigitalAsset` | `digital_assets` | Referensi penyimpanan cloud | Kunci penyimpanan `@vercel/blob`, nama file, ukuran byte, tipe MIME |
| `DownloadGrant` | `download_grants` | Pengaturan akses unduhan | Terikat pada `[orderItemId, digitalAssetId]`, `expiresAt` (48 jam), `downloadCount` (maksimal 5) |
| `AuditLog` | `audit_logs` | Catatan aktivitas keamanan | Referensi pengguna, nama aksi, ID entitas target, alamat IP, metadata JSON |
| `AuthRateLimit` | `auth_rate_limits` | Pembatas percobaan brute-force | Primary key yang di-hash dengan SHA-256 (`key`), jumlah percobaan, waktu `blockedUntil` |
| `VerificationToken` | `verification_tokens` | Penyimpanan OTP email | Identifier gabungan `[identifier, token]`, kedaluwarsa dalam 10 menit |

---

## Struktur Proyek

```text
eincshop/
├── prisma/
│   ├── schema.prisma          # Model database, enum, indeks, dan relasi PostgreSQL
│   └── migrations/            # Riwayat migrasi database
├── src/
│   ├── app/
│   │   ├── (auth)/            # Grup rute autentikasi
│   │   │   ├── actions.ts     # Server Actions untuk Register, Login, verifikasi OTP, dan kirim ulang
│   │   │   ├── auth-form.tsx  # Form login/register dengan Google OAuth dan Turnstile
│   │   │   ├── login/         # Halaman login pelanggan dan penjual
│   │   │   ├── register/      # Halaman pendaftaran akun
│   │   │   └── verify-otp/    # Form verifikasi email dengan OTP 6 digit
│   │   ├── account/           # Portal pelanggan (dilindungi requireUser)
│   │   │   ├── page.tsx       # Dashboard akun
│   │   │   ├── profile/       # Pengelolaan profil dan unggahan avatar
│   │   │   ├── orders/        # Riwayat pesanan pelanggan
│   │   │   └── downloads/     # Pusat unduhan dengan pelacakan kuota
│   │   ├── admin/             # Portal penjual dan admin (dilindungi requireAdmin)
│   │   │   ├── page.tsx       # Dashboard keuangan dan grafik cashflow
│   │   │   ├── audit-logs/    # Pemeriksaan aktivitas keamanan (requireSuperAdmin)
│   │   │   ├── categories/    # Manajemen kategori
│   │   │   ├── orders/        # Pesanan toko dan pesanan tingkat platform
│   │   │   └── products/      # Inventaris, gambar, dan lampiran file digital
│   │   ├── become-seller/     # Alur pendaftaran penjual
│   │   ├── cart/              # Keranjang persisten dan pengaturan kuantitas
│   │   ├── checkout/          # Peninjauan pesanan dan inisialisasi checkout
│   │   ├── orders/            # Faktur dan status pesanan
│   │   │   └── [orderNumber]/ # Detail faktur dan aksi pembayaran
│   │   │       └── pay/       # Checkout Midtrans Snap terintegrasi
│   │   ├── products/          # Katalog publik dan halaman produk sesuai bahasa
│   │   │   └── [slug]/        # Detail produk individual
│   │   └── api/               # Serverless Route Handlers
│   │       ├── auth/          # Handler NextAuth ([...nextauth])
│   │       ├── downloads/     # Streaming file dengan batas kuota dan masa aktif ([grantId])
│   │       ├── payments/      # Verifikasi webhook Midtrans dengan SHA-512
│   │       ├── product-images/# Proxy gambar pratinjau produk
│   │       └── profile-image/ # Endpoint streaming avatar pengguna
│   ├── components/
│   │   ├── admin/             # FinancialChart, DeleteProductButton
│   │   ├── cart/              # AddToCartForm, CartItemList
│   │   ├── checkout/          # CheckoutForm
│   │   ├── layout/            # SiteHeader, MobileNav, SiteFooter, AccountMenu
│   │   ├── order/             # Badge status dan ringkasan pesanan
│   │   ├── payment/           # MidtransSnapPayment, PayOrderButton
│   │   ├── product/           # ProductCard, CatalogControls, Pagination
│   │   └── ui/                # Button, Container, Turnstile, LoadingButton, Modal
│   ├── lib/
│   │   ├── admin/             # financial-analytics.ts, seller-metrics.ts
│   │   ├── auth/              # requireUser, requireAdmin, requireSuperAdmin, cookie guest
│   │   ├── auth.ts            # Konfigurasi Auth.js, callback, provider credentials
│   │   ├── db.ts              # Singleton PrismaClient dengan adapter pool PostgreSQL
│   │   ├── email/             # sender.ts (Nodemailer Gmail SMTP dengan fallback terminal)
│   │   ├── format/            # currency.ts (formatIdr dengan perhitungan integer)
│   │   ├── i18n/              # config.ts, server.ts, client.ts, kamus bahasa (en, id)
│   │   ├── security/          # turnstile.ts, password.ts, rate-limit.ts, request.ts, otp.ts, audit.ts
│   │   ├── storage/           # product-image.ts (validasi magic-byte gambar)
│   │   └── validation/        # auth.ts, catalog.ts (skema validasi Zod)
│   └── generated/
│       └── prisma/            # Output Prisma Client lokal yang type-safe
├── next.config.ts             # Header keamanan, batas Server Actions, dan dev origins
├── package.json               # Dependensi dan script pemeliharaan
└── tsconfig.json              # Pengaturan kompilasi TypeScript dan alias path
```

---

## Variabel Lingkungan

Daftarkan seluruh variabel lingkungan di pengaturan hosting cloud, misalnya Vercel Project Settings, atau di file `.env` lokal.

| Nama Variabel | Wajib | Kategori | Deskripsi | Contoh Placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | **Ya** | Database | String koneksi PostgreSQL dengan parameter connection pooling | `postgresql://user:password@host:5432/db?sslmode=require` |
| `AUTH_SECRET` | **Ya** | Keamanan | Secret untuk mengenkripsi token sesi JWT Auth.js | `generate-random-32-chars-string` |
| `AUTH_GOOGLE_ID` | Opsional | Auth | Client ID Google Cloud OAuth untuk login satu klik | `your-google-client-id.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Opsional | Auth | Client Secret Google Cloud OAuth | `GOCSPX-yourGoogleClientSecret` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | **Ya** | Pembayaran | Client Key Midtrans untuk menampilkan checkout Snap | `Mid-client-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_SERVER_KEY` | **Ya** | Pembayaran | Server Key Midtrans untuk API Snap dan tanda tangan webhook | `Mid-server-xxxxxxxxxxxxxxxx` |
| `MIDTRANS_IS_PRODUCTION` | Opsional | Pembayaran | Menentukan endpoint Midtrans Production atau Sandbox | `false` (default) atau `true` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Ya** | Keamanan | Site Key publik Cloudflare Turnstile untuk widget frontend | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `TURNSTILE_SECRET_KEY` | **Ya** | Keamanan | Secret Key privat Cloudflare Turnstile untuk verifikasi server | `0x4AAAAAAxxxxxxxxxxxxxx` |
| `BLOB_READ_WRITE_TOKEN` | **Ya** | Storage | Token akses untuk penyimpanan privat `@vercel/blob` | `vercel_blob_rw_xxxxxxxxxxxx` |
| `SMTP_USER` | Opsional | Email | Alamat Gmail atau SMTP khusus untuk mengirim kode OTP | `your-service@gmail.com` |
| `SMTP_PASS` | Opsional | Email | SMTP App Password 16 karakter; spasi dibersihkan otomatis | `abcd efgh ijkl mnop` |
| `PAYMENT_PROVIDER` | Opsional | Pembayaran | Pengaturan untuk pengujian; gunakan `dummy` hanya di luar produksi | `midtrans` (default) |
| `NEXT_PUBLIC_APP_URL` | Opsional | App | URL dasar kanonikal aplikasi | `http://localhost:3000` |
| `NODE_ENV` | Opsional | Runtime | Lingkungan eksekusi Node.js | `development` atau `production` |

---

## Cara Memulai

### Prasyarat

Pastikan perangkat dan layanan berikut sudah tersedia:

- Node.js versi **20.x** atau **22.x LTS**
- Database PostgreSQL yang aktif, misalnya Supabase, Neon, atau PostgreSQL 15+ lokal
- Site Key dan Secret Key Cloudflare Turnstile
- Akun Merchant Midtrans dalam mode Sandbox atau Production

### Instalasi

```bash
# 1. Klon repositori dan masuk ke direktori proyek
git clone https://github.com/sukiliar8282/eincshop.git
cd eincshop

# 2. Pasang dependensi
npm install

# 3. Buat Prisma Client dan sinkronkan skema database
npx prisma generate
npx prisma db push

# 4. Jalankan server pengembangan lokal
npm run dev
```

Setelah server berjalan, buka [http://localhost:3000](http://localhost:3000) di peramban.

---

## Perintah Tersedia

Daftar perintah berikut tersedia di `package.json`:

| Perintah | Baris Perintah | Fungsi |
|---|---|---|
| `npm run dev` | `next dev` | Menjalankan server pengembangan Next.js dengan Turbopack |
| `npm run build` | `prisma generate && next build` | Membuat Prisma Client dan membangun aplikasi untuk produksi |
| `npm run start` | `next start` | Menjalankan hasil build produksi |
| `npm run lint` | `eslint` | Memeriksa kualitas kode menggunakan ESLint |
| `npm run postinstall` | `prisma generate` | Membuat Prisma Client secara otomatis setelah `npm install` |

---

## Daftar Rute Halaman

### Halaman Publik dan Belanja

| Rute | Akses | Deskripsi |
|---|---|---|
| `/` | Publik | Halaman utama dengan produk digital pilihan dan indikator kepercayaan |
| `/products` | Publik | Katalog produk dengan filter kategori, pencarian kata kunci, dan pengurutan |
| `/products/[slug]` | Publik | Detail produk beserta gambar pratinjau |
| `/cart` | Publik / Guest | Keranjang belanja yang terhubung ke sesi pengguna atau cookie guest |
| `/checkout` | Publik / Guest | Peninjauan dan konfirmasi pesanan sebelum pembayaran |

### Autentikasi

| Rute | Akses | Deskripsi |
|---|---|---|
| `/login` | Pengunjung | Login melalui Google OAuth atau Gmail/password dengan Turnstile CAPTCHA |
| `/register` | Pengunjung | Pendaftaran akun baru dengan alamat `@gmail.com` |
| `/verify-otp` | Pengguna Belum Terverifikasi | Memasukkan kode verifikasi email 6 digit yang dikirim melalui SMTP |

### Portal Pembeli

| Rute | Akses | Deskripsi |
|---|---|---|
| `/account` | Pembeli (`CUSTOMER`) | Ringkasan akun pembeli |
| `/account/profile` | Pembeli (`CUSTOMER`) | Memperbarui profil dan mengunggah avatar |
| `/account/orders` | Pembeli (`CUSTOMER`) | Melihat faktur pesanan dan status pembayaran |
| `/account/downloads` | Pembeli (`CUSTOMER`) | Melihat grant unduhan aktif, tanggal kedaluwarsa, dan sisa kuota |

### Portal Penjual dan Administrator

| Rute | Akses | Deskripsi |
|---|---|---|
| `/become-seller` | Pengguna Terautentikasi | Mengajukan pembukaan toko penjual |
| `/admin` | `SELLER` / `ADMIN` | Dashboard operasional dengan grafik cashflow dan metrik penjualan |
| `/admin/products` | `SELLER` / `ADMIN` | Manajemen inventaris yang terpisah per penjual; admin dapat melihat semua produk |
| `/admin/products/new` | `SELLER` / `ADMIN` | Membuat produk dan mengunggah file digital |
| `/admin/products/[id]` | `SELLER` / `ADMIN` | Detail produk |
| `/admin/products/[id]/edit` | `SELLER` / `ADMIN` | Mengubah informasi, harga, dan kategori produk |
| `/admin/products/[id]/images` | `SELLER` / `ADMIN` | Mengelola gambar produk dengan validasi magic byte |
| `/admin/products/[id]/assets` | `SELLER` / `ADMIN` | Mengelola file digital yang dapat diunduh |
| `/admin/categories` | `SELLER` / `ADMIN` | Membuat dan mengelola kategori produk |
| `/admin/orders` | `SELLER` / `ADMIN` | Memantau pesanan masuk sesuai penjual; admin dapat melihat semua pesanan |
| `/admin/audit-logs` | Super Admin (`ADMIN`) | Memeriksa log keamanan sistem; akses khusus untuk role `ADMIN` |

### Pesanan dan Pembayaran

| Rute | Akses | Deskripsi |
|---|---|---|
| `/orders/[orderNumber]` | Pemilik Pesanan | Faktur pesanan terperinci dan aksi unduh untuk pesanan yang sudah lunas |
| `/orders/[orderNumber]/pay` | Pemilik Pesanan | Membuka checkout Midtrans Snap yang terintegrasi |

---

## Endpoint API & Server Actions

### Route Handlers

| Endpoint | Method | Otorisasi | Fungsi |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | Publik | Pengelolaan sesi Auth.js, callback OAuth, dan sign-out |
| `/api/downloads/[grantId]` | `GET` | Sesi Pengguna | Mengirim file setelah memeriksa masa aktif 48 jam dan batas 5 unduhan |
| `/api/payments/midtrans` | `POST` | Webhook Midtrans | Memverifikasi tanda tangan SHA-512, memproses pembayaran, dan membuat grant unduhan |
| `/api/product-images/[imageId]` | `GET` | Publik | Menyajikan gambar pratinjau produk dari storage |
| `/api/profile-image` | `GET` | Terautentikasi | Menyajikan avatar pengguna |

### Server Actions Utama

| Server Action | Lokasi File | Akses | Mekanisme Keamanan |
|---|---|---|---|
| `registerAction` | `src/app/(auth)/actions.ts` | Publik | Validasi Zod, pembatasan `@gmail.com`, Turnstile, rate limit |
| `loginAction` | `src/app/(auth)/actions.ts` | Publik | Validasi Zod, Turnstile, rate limit, pemeriksaan kredensial Auth.js |
| `verifyOtpAction` | `src/app/(auth)/actions.ts` | Publik | Regex 6 digit, rate limit (5 percobaan/10 menit), perbandingan SHA-256, AuditLog |
| `resendOtpAction` | `src/app/(auth)/actions.ts` | Publik | Rate limit (3 percobaan/15 menit), pembuatan ulang OTP kriptografis, Nodemailer |
| `addToCartAction` | `src/app/cart/actions.ts` | Publik / Guest | Pemeriksaan stok terbaru dan upsert item keranjang secara atomik |
| `createOrderAction` | `src/modules/orders/actions.ts` | User / Guest | `$transaction` atomik, penghitungan ulang harga dari database, pembuatan Order |
| `createMidtransPaymentAction` | `src/modules/payments/actions.ts` | Pemilik Order | Pemeriksaan status pesanan dan pembuatan token Midtrans Snap |
| `uploadProductImageAction` | `src/modules/catalog/image-actions.ts` | Seller / Admin | Pemeriksaan kepemilikan, validasi magic byte, batas 5MB, unggahan Blob |
| `becomeSellerAction` | `src/app/become-seller/actions.ts` | Customer | Validasi Zod, perubahan role menjadi `SELLER`, pencatatan AuditLog |

---

## Alur Pembayaran dan Pengiriman Digital

```text
[Pembeli / Guest] ──> Menambahkan Produk ke Keranjang
       │
       ▼
[Checkout (/checkout)] ──> Server Action membuat Order melalui $transaction (Harga dikunci dari DB)
       │
       ▼
[API Midtrans Snap] ──> Mengembalikan Token Snap dan URL Kasir
       │
       ▼
[Pembeli Membayar] ──> Virtual Account / QRIS / Kartu Kredit / Minimarket
       │
       ▼
[Webhook Midtrans (/api/payments/midtrans)]
       │
       ├── 1. Memverifikasi tanda tangan SHA-512 (order_id + status_code + gross_amount + serverKey)
       ├── 2. Memeriksa mata uang (IDR) dan nominal terhadap order.totalMinor di DB
       ├── 3. Menjalankan $transaction secara atomik:
       │      ├── Mengubah status Payment menjadi PAID
       │      ├── Mengubah status Order menjadi PAID
       │      ├── Mengubah status Cart menjadi CONVERTED
       │      └── Menyimpan PaymentEvent (idempoten melalui unique constraint)
       │
       └── 4. Menjalankan createDownloadGrantsForPaidOrder:
              └── Membuat DownloadGrant (expiresAt = sekarang + 48 jam, downloadCount = 0)
                     │
                     ▼
[Pembeli Membuka /account/downloads atau /orders/[orderNumber]]
       │
       ▼
[Permintaan Unduh (/api/downloads/[grantId])]
       ├── Memeriksa: session.user.id == grant.userId
       ├── Memeriksa: order.paymentStatus == "PAID"
       ├── Memeriksa: sekarang <= grant.expiresAt (masa aktif 48 jam)
       ├── Memeriksa: grant.downloadCount < 5 (batas kuota)
       ├── Menambah downloadCount secara atomik (+1)
       └── Mengirim file biner dari storage privat @vercel/blob
```

---

## Internasionalisasi

EINCSHOP menyediakan dukungan Bahasa Indonesia dan Bahasa Inggris melalui sistem lokalisasi bawaan.

1. Preferensi bahasa disimpan dalam cookie HTTP `einc_locale`. Nilainya dibatasi menjadi `id` atau `en`, dengan `en` sebagai pilihan default.
2. Server Components memuat kamus bahasa (`id.ts` atau `en.ts`) melalui `getDictionary()`. Kamus diproses di sisi server sehingga tidak menambah ukuran bundle JavaScript di peramban.
3. Komponen client mengambil terjemahan melalui hook reaktif `useI18n()`.
4. Format mata uang mengikuti bahasa yang dipilih:
   - Bahasa Indonesia: `Rp 150.000` (`id-ID`)
   - Bahasa Inggris: `IDR 150,000` (`en-US`)

---

## Praktik Keamanan

### 1. Mata Uang Berbasis Integer

- **Ancaman yang ditangani:** Kesalahan pembulatan floating-point, misalnya `0.1 + 0.2 = 0.30000000000000004`, yang dapat menyebabkan selisih pembukuan atau penolakan transaksi oleh payment gateway.
- **Cara kerja:** Harga produk, total item, dan subtotal pesanan disimpan serta dihitung sebagai bilangan bulat Rupiah (`priceMinor`). Pendekatan ini menghindari perhitungan berdasarkan pecahan nilai mata uang.
- **Lokasi implementasi:** `src/lib/format/currency.ts`, `prisma/schema.prisma`, `src/modules/orders/service.ts`.
- **Cara penggunaan:** Tetapkan harga dengan `priceMinor: Math.round(nominalRupiah)` dan tampilkan melalui `formatIdr(amountMinor, locale)`.

### 2. Isolasi Antarpenjual dan Pemeriksaan Hak Akses ke Database

- **Ancaman yang ditangani:** Kebocoran data antarpenjual dan eskalasi hak akses, misalnya penjual mengakses atau menghapus produk milik penjual lain, atau akun yang sudah ditangguhkan tetap beroperasi menggunakan JWT lama.
- **Cara kerja:** Identitas penjual tidak diambil dari input yang dikirim klien. `requireAdmin()` mengambil ID pengguna dari sesi terautentikasi dan menerapkan filter `{ sellerId: admin.id }` untuk pengguna non-superadmin. Setiap request administratif juga memeriksa status `ACTIVE` langsung ke PostgreSQL.
- **Lokasi implementasi:** `src/lib/auth/require-user.ts`, `src/app/admin/products/page.tsx`, `src/modules/catalog/image-actions.ts`.
- **Cara penggunaan:** Lindungi halaman administratif menggunakan `await requireAdmin()` atau `await requireSuperAdmin()`.

### 3. Grant Unduhan dengan Batas Waktu dan Kuota

- **Ancaman yang ditangani:** Penyebaran aset digital tanpa izin, kebocoran tautan unduhan permanen, dan penggunaan bandwidth secara berlebihan.
- **Cara kerja:** File digital disimpan di `@vercel/blob` secara privat, bukan melalui URL publik permanen. Rute `/api/downloads/[grantId]` memeriksa status pembayaran, memastikan masa aktif belum lewat (**48 jam**), dan membatasi jumlah unduhan melalui `MAX_DOWNLOAD_LIMIT` (**5 kali**).
- **Lokasi implementasi:** `src/app/api/downloads/[grantId]/route.ts`, `src/modules/digital-delivery/service.ts`.
- **Cara penggunaan:** Grant dibuat otomatis setelah pembayaran selesai melalui `createDownloadGrantsForPaidOrder(orderId)`.

### 4. Perlindungan Bot dengan Cloudflare Turnstile

- **Ancaman yang ditangani:** Pembuatan akun otomatis, credential stuffing, dan spam pada endpoint autentikasi.
- **Cara kerja:** Form login dan registrasi menggunakan widget Turnstile. Token yang dikirim pengguna diverifikasi di sisi server melalui API Cloudflare di `https://challenges.cloudflare.com/turnstile/v0/siteverify` sebelum kredensial diproses.
- **Lokasi implementasi:** `src/components/ui/turnstile.tsx`, `src/lib/security/turnstile.ts`, `src/app/(auth)/actions.ts`.
- **Cara penggunaan:** Pasang `<Turnstile />` pada formulir dan panggil `await verifyTurnstileToken(token, requestIp)` di Server Actions.

### 5. Pembatasan Email Gmail dan Verifikasi OTP 6 Digit

- **Ancaman yang ditangani:** Pendaftaran menggunakan email sekali pakai, pembuatan akun otomatis, dan penggunaan akun yang belum terverifikasi.
- **Cara kerja:** Validasi Zod membatasi pendaftaran ke alamat `@gmail.com`. Akun baru harus memverifikasi kode OTP 6 digit yang dibuat dengan `randomInt`, di-hash menggunakan SHA-256 di database, lalu dikirim melalui Gmail SMTP. Akun yang belum terverifikasi tidak dapat mengakses area pembeli atau penjual.
- **Lokasi implementasi:** `src/lib/validation/auth.ts`, `src/lib/security/otp.ts`, `src/lib/email/sender.ts`, `src/app/(auth)/verify-otp/`.
- **Cara penggunaan:** Proses verifikasi dijalankan melalui `registerAction` dan diberlakukan melalui `requireUser()`.

### 6. Resolusi IP Klien dan Perlindungan Header Edge

- **Ancaman yang ditangani:** Pengelabuan IP dan upaya melewati rate limit melalui header `X-Forwarded-For` palsu.
- **Cara kerja:** Sistem menentukan IP klien dengan urutan prioritas header yang ketat. Header `cf-connecting-ip` dari Cloudflare diprioritaskan sebelum header proxy standar.
- **Lokasi implementasi:** `src/lib/security/request.ts`.
- **Cara penggunaan:** Panggil `const clientIp = await getRequestIp();` di Server Actions dan pencatatan audit.

### 7. Verifikasi Webhook SHA-512 dan Pemrosesan Idempoten

- **Ancaman yang ditangani:** Notifikasi pembayaran palsu dan pemrosesan pesanan berulang akibat webhook yang dikirim lebih dari sekali.
- **Cara kerja:** Payload webhook Midtrans diverifikasi dengan menghitung hash SHA-512 dari `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`. Hasilnya dibandingkan menggunakan `crypto.timingSafeEqual`. Pemrosesan berlangsung di dalam `$transaction` atomik, sementara catatan `PaymentEvent` menggunakan `@@unique([provider, providerEventId])` untuk mencegah pemrosesan event yang sama berulang kali.
- **Lokasi implementasi:** `src/app/api/payments/midtrans/route.ts`.
- **Cara penggunaan:** Mekanisme ini diterapkan otomatis pada endpoint `POST /api/payments/midtrans`.

### 8. Validasi Gambar Menggunakan Magic Byte

- **Ancaman yang ditangani:** Unggahan file berbahaya yang menyamar sebagai gambar dengan mengganti ekstensi file, misalnya skrip executable yang diberi nama `.jpg`.
- **Cara kerja:** Server tidak hanya mengandalkan ekstensi atau MIME type dari peramban. Sistem memeriksa 12 byte pertama dari buffer file untuk memastikan tanda tangan gambar sesuai: JPEG (`0xFF 0xD8 0xFF`), PNG (`0x89 0x50 0x4E 0x47`), dan WebP (`RIFF...WEBP`). Ukuran unggahan dibatasi maksimal 5MB.
- **Lokasi implementasi:** `src/lib/storage/product-image.ts`.
- **Cara penggunaan:** Validasi dijalankan di dalam `uploadProductImageAction`.

### 9. Rate Limiting Berbasis Database dengan SHA-256

- **Ancaman yang ditangani:** Percobaan menebak password secara berulang, enumerasi OTP, dan penggunaan sumber daya server secara berlebihan.
- **Cara kerja:** `consumeAuthRateLimit` mencatat percobaan autentikasi ke PostgreSQL. Identifier di-hash dengan SHA-256 sebelum disimpan, sehingga alamat IP dan email tidak dicatat sebagai teks biasa. Data kedaluwarsa dibersihkan secara probabilistik, dengan peluang 5% pada setiap request.
- **Lokasi implementasi:** `src/lib/security/rate-limit.ts`.
- **Cara penggunaan:** Jalankan `await consumeAuthRateLimit(key, options)` sebelum memproses aksi sensitif.

### 10. Header Keamanan HTTP dan Konfigurasi Default

- **Ancaman yang ditangani:** Cross-Site Scripting (XSS), clickjacking, MIME sniffing, dan serangan SSL-stripping.
- **Cara kerja:** `next.config.ts` menerapkan header keamanan pada respons HTTP, termasuk HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, dan `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Pengaturan `poweredByHeader` juga dinonaktifkan.
- **Lokasi implementasi:** `next.config.ts`.
- **Cara penggunaan:** Header ini diterapkan otomatis pada respons HTTP yang dikirim aplikasi.

---

## Lisensi

### EINCSHOP — Lisensi Proprietary

Copyright © 2026 EINCSHOP. All Rights Reserved.

Kode sumber dalam repositori ini disediakan hanya untuk dilihat dan dijadikan referensi.

Penyalinan, modifikasi, distribusi ulang, pemberian sublisensi, atau penggunaan kode ini untuk deployment komersial maupun publik memerlukan izin tertulis terlebih dahulu dari pemegang hak cipta.

Seluruh hak dilindungi, kecuali jika hukum yang berlaku menentukan lain.

PERANGKAT LUNAK INI DISEDIAKAN "APA ADANYA", TANPA JAMINAN DALAM BENTUK APA PUN.

