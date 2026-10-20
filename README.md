# EINCSHOP -- Enterprise Multi-Seller Digital Marketplace
A modern, production-grade digital assets marketplace built with Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Prisma ORM, PostgreSQL, Auth.js v5 Beta, and Midtrans Payment Gateway.

Think of it like a digital version of a shopping mall. Every seller gets their own locked storefront. Buyers browse the mall, pick items, pay at a secure automated cashier, and instantly receive a special ticket that unlocks their purchased digital files. No seller can peek into another seller's cash register or inventory -- everything is isolated and secure by design.
---
## Table of Contents

- [Tech Stack]\(#tech-stack)

- [Features]\(#features)

- [Database Architecture]\(#database-architecture)

- [Project Structure]\(#project-structure)

- [Getting Started]\(#getting-started)

- [Available Routes]\(#available-routes)

- [Internationalization]\(#internationalization)

- [Security Practices]\(#security-practices)

- [License]\(#license)
---
## Tech Stack

| Layer | Technology |

|---|---|

| Framework | Next.js 16.3.6 (App Router) |

| UI Library | React 19.2.8 |

| Language | TypeScript 5.x |

| Styling | Tailwind CSS v4 |

| ORM | Prisma with PostgreSQL |

| Authentication | Auth.js v5 Beta (Google OAuth + Credentials) |

| Payment Gateway | Midtrans (Snap Token + Webhook) |

| State Management | React Server Components + Server Actions |
---
## Features

### For Buyers (Customers)

- **Product Catalog** -- Browse and search digital products with category filtering, sorting by price or date, and grid/list view toggle.

- **Shopping Cart** -- Persistent cart that survives page refreshes. Add, remove, and review items before checkout.

- **Secure Checkout** -- Integrated with Midtrans payment gateway. Pay via bank transfer, e-wallet, credit card, or convenience store.

- **Download Center** -- After a successful payment, the system automatically generates a secure download grant. Buyers access their purchased files from a dedicated downloads page.

- **Order History** -- Track all past and current orders with real-time payment status updates.

- **User Profile** -- Manage personal information and profile avatar.

- **Bilingual Interface** -- The entire storefront supports both English and Indonesian, automatically detected from browser settings.

### For Sellers

- **Seller Onboarding** -- Any registered user can apply to become a seller through a guided registration form (store name, description, branding).

- **Product Management** -- Create, edit, publish, and archive digital products. Upload product images, set pricing in Rupiah, assign categories, and attach downloadable digital assets.

- **Sales Dashboard** -- Visual analytics with interactive cashflow charts (revenue, expenses, net profit), key performance indicators (total revenue, order count, product count), and a detailed financial ledger.

- **Order Management** -- View incoming orders for your products, see buyer details, payment status, and your revenue share per transaction.

- **Category Management** -- Create and manage product categories for your storefront.

### For Administrators

- **Full Dashboard Access** -- Everything sellers see, plus platform-wide oversight.

- **Audit Logs** -- Tamper-evident activity log recording every sensitive action on the platform (who did what, when, from which IP address).

- **User and Role Management** -- Control user roles (Customer, Seller, Admin) and account statuses (Active, Suspended).

### Platform-Wide

- **Internationalization (i18n)** -- Complete bilingual support across every single page, button, label, error message, and notification. English and Indonesian dictionaries with automatic locale detection.

- **Responsive Design** -- Mobile-first layout with dedicated mobile navigation, touch-friendly interactions, and adaptive grid layouts.

- **Dark/Light Theming** -- CSS custom property system supporting theme switching.

- **Integer Currency** -- All monetary values stored as minor units (the smallest denomination) to eliminate floating-point rounding errors in financial calculations.
---
## Database Architecture

The application uses PostgreSQL through Prisma ORM. Here are the core data models:

| Model | Purpose |

|---|---|

| User | Account identity with multi-tier roles (Customer, Seller, Admin), store branding fields, and profile avatars |

| Account | OAuth provider connections (Google) linked to users |

| Session | Server-side session management for authentication |

| Product | Digital catalog entries with minor-unit pricing, seller ownership, status lifecycle (Draft, Published, Archived) |

| Category | Product taxonomy and marketplace categorization |

| Cart / CartItem | Persistent shopping carts with status tracking (Active, Converted, Abandoned) |

| Order / OrderItem | Immutable sales invoices that lock prices at the moment of purchase |

| Payment | Transaction audit trail including Snap tokens, gateway responses, and webhook payloads |

| DigitalAsset | Cloud storage references for downloadable files attached to products |

| DownloadGrant | Cryptographic access tokens linking buyers to their purchased digital files |

| AuditLog | Security event ledger recording actor, action, entity type, and IP address |

| AuthRateLimit | Brute-force protection tracking failed login attempts per identifier |
---
## Project Structure

```text
eincshop/
├── prisma/
│   ├── schema.prisma          # Database models and enums
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login and registration pages
│   │   ├── account/           # Buyer portal (profile, orders, downloads)
│   │   ├── admin/             # Seller and admin dashboard
│   │   │   ├── products/      # Product management (CRUD)
│   │   │   ├── categories/    # Category management
│   │   │   ├── orders/        # Incoming sales orders
│   │   │   └── audit-logs/    # Platform audit trail
│   │   ├── become-seller/     # Seller onboarding flow
│   │   ├── cart/              # Shopping cart page
│   │   ├── orders/            # Order invoices and payment pages
│   │   ├── products/          # Public product catalog and details
│   │   └── api/               # API routes (auth, payment webhooks, downloads)
│   ├── components/
│   │   ├── layout/            # Header, footer, mobile navigation
│   │   ├── product/           # Product cards and catalog controls
│   │   ├── order/             # Order status badges
│   │   ├── payment/           # Payment buttons and flows
│   │   ├── admin/             # Financial charts and dashboard widgets
│   │   └── ui/                # Reusable UI primitives (Button, Input, etc.)
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── dictionaries/  # en.ts and id.ts language files
│   │   │   ├── client.ts      # useI18n() hook for client components
│   │   │   └── server.ts      # getDictionary() for server components
│   │   ├── format/            # Currency formatter (formatIdr)
│   │   └── admin/             # Financial analytics calculations
│   └── generated/
│       └── prisma/            # Auto-generated Prisma client
```

---
```

## Getting Started

### Prerequisites

- Node.js version 20.x or 22.x LTS

- A running PostgreSQL database (local or cloud such as Neon, Supabase, or Railway)

### Installation

```bash
# Navigate to the application directory
cd eincshop

# Install dependencies
npm install

# Generate Prisma Client and sync the database schema
npx prisma generate
npx prisma db push

# (Optional) Seed demo products and categories
npm run seed

# Start the development server
npm run dev
```

Open your browser at `http://localhost:3000`.

### **Database Inspector**

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`, where you can inspect and edit records directly.

---
## **Available Routes**

### **Public Pages**

| Route              | Description                             |
| ------------------ | --------------------------------------- |
| `/`                | Homepage                                |
| `/products`        | Product catalog with filters and search |
| `/products/[slug]` | Individual product detail page          |
| `/cart`            | Shopping cart                           |

### **Authentication**

| Route       | Description                           |
| ----------- | ------------------------------------- |
| `/login`    | Sign in with Google or email/password |
| `/register` | Create a new account                  |

### **Buyer Portal**

| Route                | Description                    |
| -------------------- | ------------------------------ |
| `/account/profile`   | Edit personal information      |
| `/account/orders`    | View order history             |
| `/account/downloads` | Access purchased digital files |

### **Seller and Admin Portal**

| Route                 | Description                                |
| --------------------- | ------------------------------------------ |
| `/admin`              | Dashboard with analytics and quick actions |
| `/admin/products`     | Manage your product catalog                |
| `/admin/products/new` | Create a new product                       |
| `/admin/categories`   | Manage categories                          |
| `/admin/orders`       | View incoming orders                       |
| `/admin/audit-logs`   | Platform activity audit trail              |

### **Other**

| Route                       | Description                         |
| --------------------------- | ----------------------------------- |
| `/become-seller`            | Seller registration onboarding      |
| `/orders/[orderNumber]`     | Order invoice detail                |
| `/orders/[orderNumber]/pay` | Payment page (Midtrans integration) |
---
## **Internationalization**

The entire application is fully bilingual (English and Indonesian). The system works like this:

1. The browser sends a language preference header.
2. The server reads it and loads the matching dictionary file (`en.ts` or `id.ts`).
3. Every page, component, button label, error message, status badge, and notification pulls its text from the active dictionary.
4. Currency formatting also adapts: English users see "IDR 99,000" while Indonesian users see "Rp 99.000".

There is zero hardcoded user-facing text anywhere in the codebase. Every string goes through the dictionary system.
---
## **Security Practices**

1. **Integer Minor Unit Currency** -- All prices and calculations use the smallest currency unit (single Rupiah, not thousands). This prevents the classic floating-point bug where 0.1 + 0.2 does not equal 0.3 in JavaScript. In simple terms: the system counts individual coins, not bills, so there is never a rounding error.
2. **Tenant Isolation** -- Seller API endpoints never trust a seller ID sent from the browser. Instead, the server extracts the seller identity directly from the authenticated session. One seller can never access another seller's data, even if they manually craft API requests.
3. **Signed Download Access** -- Digital files are never served through a public URL. When a buyer clicks download, the system verifies that they have a valid, non-expired download grant for that specific file before streaming the bytes. Think of it like a concert ticket -- even if you know where the venue is, you cannot get in without a valid ticket with your name on it.
4. **Rate-Limited Authentication** -- Login attempts are tracked and throttled to prevent brute-force password guessing attacks.
5. **Audit Trail** -- Every sensitive administrative action is recorded with the actor identity, timestamp, action type, affected entity, and source IP address. This log cannot be modified or deleted through the application interface.
---
## **License**

Distributed under the MIT License. Feel free to use and extend for commercial or portfolio purposes.
---
# **EINCSHOP -- Platform Marketplace Aset Digital Multi-Seller**

Platform marketplace aset digital modern dan siap produksi yang dibangun dengan Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Prisma ORM, PostgreSQL, Auth.js v5 Beta, dan Midtrans Payment Gateway.

Bayangkan seperti versi digital dari sebuah pusat perbelanjaan. Setiap penjual punya toko sendiri yang terkunci. Pembeli berkeliling mall, memilih barang, membayar di kasir otomatis yang aman, lalu langsung menerima tiket khusus yang membuka akses ke file digital yang sudah dibeli. Tidak ada penjual yang bisa mengintip kasir atau inventaris penjual lain -- semuanya terisolasi dan aman sejak awal.
---
## **Daftar Isi**

- Teknologi yang Digunakan
- Fitur-Fitur
- Arsitektur Database
- Struktur Proyek
- Cara Memulai
- Daftar Rute Halaman
- Internasionalisasi
- Praktik Keamanan
- Lisensi
---
## **Teknologi yang Digunakan**

| Lapisan         | Teknologi                                    |
| --------------- | -------------------------------------------- |
| Framework       | Next.js 16.3.6 (App Router)                  |
| Library UI      | React 19.2.8                                 |
| Bahasa          | TypeScript 5.x                               |
| Styling         | Tailwind CSS v4                              |
| ORM             | Prisma dengan PostgreSQL                     |
| Autentikasi     | Auth.js v5 Beta (Google OAuth + Credentials) |
| Payment Gateway | Midtrans (Snap Token + Webhook)              |
| Manajemen State | React Server Components + Server Actions     |
---
## **Fitur-Fitur**

### **Untuk Pembeli (Customer)**

- **Katalog Produk** -- Jelajahi dan cari produk digital dengan filter kategori, pengurutan berdasarkan harga atau tanggal, dan tampilan grid/list.
- **Keranjang Belanja** -- Keranjang yang persisten dan tidak hilang saat halaman di-refresh. Tambah, hapus, dan tinjau item sebelum checkout.
- **Checkout Aman** -- Terintegrasi dengan payment gateway Midtrans. Bayar via transfer bank, e-wallet, kartu kredit, atau minimarket.
- **Pusat Download** -- Setelah pembayaran berhasil, sistem otomatis membuat grant download yang aman. Pembeli mengakses file yang sudah dibeli dari halaman download khusus.
- **Riwayat Pesanan** -- Lacak semua pesanan lama dan yang sedang berjalan dengan pembaruan status pembayaran secara real-time.
- **Profil Pengguna** -- Kelola informasi pribadi dan avatar profil.
- **Antarmuka Dwibahasa** -- Seluruh tampilan toko mendukung Bahasa Inggris dan Bahasa Indonesia, terdeteksi otomatis dari pengaturan browser.

### **Untuk Penjual (Seller)**

- **Onboarding Penjual** -- Setiap pengguna terdaftar bisa mendaftar menjadi penjual melalui formulir pendaftaran terpandu (nama toko, deskripsi, branding).
- **Manajemen Produk** -- Buat, edit, publikasikan, dan arsipkan produk digital. Upload gambar produk, atur harga dalam Rupiah, tetapkan kategori, dan lampirkan aset digital yang bisa diunduh.
- **Dashboard Penjualan** -- Analitik visual dengan grafik cashflow interaktif (pendapatan, pengeluaran, laba bersih), indikator kinerja utama (total pendapatan, jumlah pesanan, jumlah produk), dan buku besar keuangan terperinci.
- **Manajemen Pesanan** -- Lihat pesanan masuk untuk produk Anda, lihat detail pembeli, status pembayaran, dan bagian pendapatan Anda per transaksi.
- **Manajemen Kategori** -- Buat dan kelola kategori produk untuk etalase toko Anda.

### **Untuk Administrator**

- **Akses Dashboard Penuh** -- Semua yang bisa dilihat penjual, ditambah pengawasan seluruh platform.
- **Log Audit** -- Catatan aktivitas yang tidak bisa dimanipulasi, merekam setiap aksi sensitif di platform (siapa melakukan apa, kapan, dari alamat IP mana).
- **Manajemen Pengguna dan Peran** -- Kontrol peran pengguna (Customer, Seller, Admin) dan status akun (Aktif, Ditangguhkan).

### **Seluruh Platform**

- **Internasionalisasi (i18n)** -- Dukungan dwibahasa lengkap di setiap halaman, tombol, label, pesan error, dan notifikasi. Kamus Bahasa Inggris dan Indonesia dengan deteksi locale otomatis.
- **Desain Responsif** -- Layout mobile-first dengan navigasi mobile khusus, interaksi ramah sentuh, dan layout grid yang adaptif.
- **Tema Gelap/Terang** -- Sistem CSS custom property yang mendukung perpindahan tema.
- **Mata Uang Integer** -- Semua nilai uang disimpan dalam satuan terkecil (Rupiah satuan) untuk menghilangkan error pembulatan floating-point dalam kalkulasi keuangan.
---
## **Arsitektur Database**

Aplikasi menggunakan PostgreSQL melalui Prisma ORM. Berikut model data utamanya:

| Model             | Fungsi                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| User              | Identitas akun dengan peran bertingkat (Customer, Seller, Admin), field branding toko, dan avatar profil       |
| Account           | Koneksi provider OAuth (Google) yang terhubung ke pengguna                                                     |
| Session           | Manajemen sesi sisi-server untuk autentikasi                                                                   |
| Product           | Entri katalog digital dengan harga minor-unit, kepemilikan penjual, siklus status (Draft, Published, Archived) |
| Category          | Taksonomi produk dan kategorisasi marketplace                                                                  |
| Cart / CartItem   | Keranjang belanja persisten dengan pelacakan status (Active, Converted, Abandoned)                             |
| Order / OrderItem | Invoice penjualan yang tidak bisa diubah, mengunci harga pada saat pembelian                                   |
| Payment           | Jejak audit transaksi termasuk token Snap, respons gateway, dan payload webhook                                |
| DigitalAsset      | Referensi penyimpanan cloud untuk file yang bisa diunduh yang dilampirkan ke produk                            |
| DownloadGrant     | Token akses kriptografis yang menghubungkan pembeli ke file digital yang sudah dibeli                          |
| AuditLog          | Buku besar kejadian keamanan yang mencatat aktor, aksi, tipe entitas, dan alamat IP                            |
| AuthRateLimit     | Perlindungan brute-force yang melacak percobaan login gagal per identifier                                     |
---
## Struktur Proyek

```text
eincshop/
├── prisma/
│   ├── schema.prisma          # Model database dan enum
│   └── seed.ts                # Seeder data demo
├── src/
│   ├── app/
│   │   ├── (auth)/            # Halaman login dan registrasi
│   │   ├── account/           # Portal pembeli (profil, pesanan, download)
│   │   ├── admin/             # Dashboard penjual dan admin
│   │   │   ├── products/      # Manajemen produk (CRUD)
│   │   │   ├── categories/    # Manajemen kategori
│   │   │   ├── orders/        # Pesanan penjualan masuk
│   │   │   └── audit-logs/    # Jejak audit platform
│   │   ├── become-seller/     # Alur onboarding penjual
│   │   ├── cart/              # Halaman keranjang belanja
│   │   ├── orders/            # Invoice pesanan dan halaman pembayaran
│   │   ├── products/          # Katalog produk publik dan detail
│   │   └── api/               # Rute API (auth, webhook pembayaran, download)
│   ├── components/
│   │   ├── layout/            # Header, footer, navigasi mobile
│   │   ├── product/           # Kartu produk dan kontrol katalog
│   │   ├── order/             # Badge status pesanan
│   │   ├── payment/           # Tombol dan alur pembayaran
│   │   ├── admin/             # Grafik keuangan dan widget dashboard
│   │   └── ui/                # Komponen UI yang dapat digunakan ulang
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── dictionaries/  # File bahasa en.ts dan id.ts
│   │   │   ├── client.ts      # Hook useI18n() untuk komponen client
│   │   │   └── server.ts      # getDictionary() untuk komponen server
│   │   ├── format/            # Formatter mata uang (formatIdr)
│   │   └── admin/             # Kalkulasi analitik keuangan
│   └── generated/
│       └── prisma/            # Prisma Client yang di-generate otomatis
```

---
## **Cara Memulai**

### **Prasyarat**

- Node.js versi 20.x atau 22.x LTS
- Database PostgreSQL yang sedang berjalan (lokal atau cloud seperti Neon, Supabase, atau Railway)

### **Instalasi**

```bash
# Masuk ke direktori aplikasi
cd eincshop

# Pasang dependensi
npm install

# Generate Prisma Client dan sinkronisasi skema database
npx prisma generate
npx prisma db push

# (Opsional) Seed produk dan kategori demo
npm run seed

# Jalankan server pengembangan
npm run dev
```

Buka browser di `http://localhost:3000`.

### **Inspektur Database**

```bash
npx prisma studio
```

Ini membuka browser database visual di `http://localhost:5555`, tempat Anda bisa memeriksa dan mengedit record secara langsung.

---
## **Daftar Rute Halaman**

### **Halaman Publik**

| Rute               | Deskripsi                                  |
| ------------------ | ------------------------------------------ |
| `/`                | Halaman utama                              |
| `/products`        | Katalog produk dengan filter dan pencarian |
| `/products/[slug]` | Halaman detail produk individual           |
| `/cart`            | Keranjang belanja                          |

### **Autentikasi**

| Rute        | Deskripsi                               |
| ----------- | --------------------------------------- |
| `/login`    | Masuk dengan Google atau email/password |
| `/register` | Buat akun baru                          |

### **Portal Pembeli**

| Rute                 | Deskripsi                            |
| -------------------- | ------------------------------------ |
| `/account/profile`   | Edit informasi pribadi               |
| `/account/orders`    | Lihat riwayat pesanan                |
| `/account/downloads` | Akses file digital yang sudah dibeli |

### **Portal Penjual dan Admin**

| Rute                  | Deskripsi                                |
| --------------------- | ---------------------------------------- |
| `/admin`              | Dashboard dengan analitik dan aksi cepat |
| `/admin/products`     | Kelola katalog produk Anda               |
| `/admin/products/new` | Buat produk baru                         |
| `/admin/categories`   | Kelola kategori                          |
| `/admin/orders`       | Lihat pesanan masuk                      |
| `/admin/audit-logs`   | Jejak audit aktivitas platform           |

### **Lainnya**

| Rute                        | Deskripsi                               |
| --------------------------- | --------------------------------------- |
| `/become-seller`            | Onboarding pendaftaran penjual          |
| `/orders/[orderNumber]`     | Detail invoice pesanan                  |
| `/orders/[orderNumber]/pay` | Halaman pembayaran (integrasi Midtrans) |
---
## **Internasionalisasi**

Seluruh aplikasi sepenuhnya dwibahasa (Inggris dan Indonesia). Sistemnya bekerja seperti ini:

1. Browser mengirim header preferensi bahasa.
2. Server membacanya dan memuat file kamus yang sesuai (`en.ts` atau `id.ts`).
3. Setiap halaman, komponen, label tombol, pesan error, badge status, dan notifikasi mengambil teksnya dari kamus yang aktif.
4. Format mata uang juga menyesuaikan: pengguna Inggris melihat "IDR 99,000" sementara pengguna Indonesia melihat "Rp 99.000".

Tidak ada teks hardcoded yang dilihat pengguna di mana pun dalam codebase. Setiap string melewati sistem kamus.
---
## **Praktik Keamanan**

1. **Mata Uang Integer Minor Unit** -- Semua harga dan kalkulasi menggunakan satuan mata uang terkecil (Rupiah satuan, bukan ribuan). Ini mencegah bug klasik floating-point di mana 0.1 + 0.2 tidak sama dengan 0.3 di JavaScript. Sederhananya: sistem menghitung koin satu per satu, bukan lembaran, jadi tidak pernah ada error pembulatan.
2. **Isolasi Tenant** -- Endpoint API penjual tidak pernah memercayai ID penjual yang dikirim dari browser. Sebaliknya, server mengekstrak identitas penjual langsung dari sesi yang sudah terautentikasi. Satu penjual tidak pernah bisa mengakses data penjual lain, meskipun mereka secara manual membuat request API.
3. **Akses Download Bertanda Tangan** -- File digital tidak pernah disajikan melalui URL publik. Ketika pembeli mengklik download, sistem memverifikasi bahwa mereka memiliki grant download yang valid dan belum kedaluwarsa untuk file spesifik tersebut sebelum mengalirkan byte-nya. Bayangkan seperti tiket konser -- meskipun Anda tahu di mana tempatnya, Anda tidak bisa masuk tanpa tiket valid dengan nama Anda di atasnya.
4. **Autentikasi dengan Rate Limit** -- Percobaan login dilacak dan dibatasi untuk mencegah serangan tebak password brute-force.
5. **Jejak Audit** -- Setiap aksi administratif yang sensitif dicatat dengan identitas pelaku, timestamp, tipe aksi, entitas yang terpengaruh, dan alamat IP sumber. Log ini tidak bisa dimodifikasi atau dihapus melalui antarmuka aplikasi.
