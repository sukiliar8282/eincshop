
# `PROJECT_CONTEXT.md`

> **Dokumen Sumber Kebenaran (Single Source of Truth) — Proyek EINCSHOP**  
> Terakhir Diperbarui: Oktober 2026

---

## 1. Project Overview & Tech Stack

**EINCSHOP** adalah marketplace aset digital multi-seller terkurasi (template kode, UI kit, sistem desain) yang mengutamakan performa tinggi, keamanan multi-tenant, dan desain visual bespoke kelas enterprise.

| Komponen | Teknologi | Keterangan Versi / Konfigurasi |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React 19 Server Components & Actions |
| **Database** | PostgreSQL | Prisma ORM 7 (`@prisma/adapter-pg` direct adapter) |
| **Styling** | Tailwind CSS v4 | CSS Custom Variables, zero arbitrary bloat |
| **Autentikasi** | Auth.js (NextAuth v5 beta) | JWT Strategy, Google OAuth + Credentials |
| **Storage Asset** | `@vercel/blob` | Penyimpanan berkas digital & gambar produk |
| **Validasi** | Zod v4 | Schema validation ketat untuk API & Form Actions |
| **Deployment** | Vercel | Live di `https://eincshop.vercel.app/` |

---

## 2. Design System & UI Guidelines

Desain mengusung estetika **editorial, presisi, minimalis, dan non-cookie-cutter** (bukan template murahan).

### A. Palet Warna (CSS Variables)
* `--color-canvas`: Latar belakang utama bernuansa warm/clean off-white (`#FBFBF9` / cream canvas).
* `--color-ink`: Teks utama & kontras gelap tegas (`#111110`).
* `--color-ink-soft`: Teks sekunder gelap (`#2A2A28`).
* `--color-line`: Garis batas halus (`#E6E6E2`).
* `--color-line-strong`: Garis batas interaktif / kontrol input.
* `--color-surface-muted`: Permukaan sekunder/kartu abu-abu hangat.
* `--color-accent`: Aksen primer brand.
* `--color-accent-soft` & `--color-accent-strong`: Badge kategori & highlight operasional.
* `--color-success-strong` (Emerald): Indikator status lunas / omzet masuk.
* `--color-danger-strong` & `--color-danger-soft` (Rose/Red): Pengeluaran, potongan fee, dan aksi destruktif.

### B. Rasio & Tata Letak Gambar Produk
* **Rasio Kartu Produk & Spotlight**: Menggunakan **`aspect-[4/3]`** (atau responsif `aspect-[16/10] sm:aspect-[4/3]`).
* **Kunci Penyelaras**: **Wajib** menyertakan **`object-cover object-top`** agar judul, logo template, dan mock-up AI pada bagian atas gambar tidak pernah terpotong (*no top crop*).
* **Ukuran Gambar Ideal**: Rasio `4:3` (rekomendasi: `1600 × 1200 px` atau `1200 × 900 px`) dengan safe-zone padding.

### C. Responsivitas Mobile & Android
* Semua touch target tombol dan navigasi wajib memiliki ukuran minimal **`min-h-11 min-w-11` (44px × 44px)** sesuai standar WCAG AAA & Android Touch Guidelines.
* Elemen tabel dan chart wajib dilengkapi pembungkus `overflow-x-auto` agar tidak terjadi *horizontal screen-stretch* pada layar ponsel sempit (360px–412px).

---

## 3. Architecture Decisions & Database Rules

### A. Prisma 7 & Driver Adapter Safety (PENTING)
Prisma 7 dengan driver adapter Postgres `@prisma/adapter-pg` memiliki pembatasan seleksi relasi bertingkat.
* **Aturan Kueri Seller**: DILARANG melakukan kueri nested aggregate yang memicu error `The 'select' statement for type Product must not be empty`.
* **Pola Wajib**: Gunakan **Direct Indexed Scalar Query**:
  1. Ambil daftar ID produk seller terlebih dahulu:
     ```ts
     const products = await prisma.product.findMany({
       where: { OR: [{ sellerId }, { sellerId: null }] },
       select: { id: true }
     });
     const productIds = products.map(p => p.id);
     ```
  2. Kueri pesanan langsung via kolom terindeks:
     ```ts
     prisma.orderItem.findMany({
       where: { productId: { in: productIds }, order: { paymentStatus: "PAID" } }
     });
     ```

### B. Autentikasi & Multi-Tenancy
* **Isolasi Seller**: Produk dan pesanan terisolasi ketat berdasarkan `sellerId` (milik akun seller atau produk legacy).
* **Validasi Email**: Wajib berakhiran domain `@gmail.com`.
* **Google OAuth**: Mendukung fleksibilitas ganda environment variables (`AUTH_GOOGLE_ID` / `GOOGLE_CLIENT_ID`) serta callback ganda (`localhost:3000` dan `eincshop.vercel.app`).

### C. Model Keuangan & Arus Kas (Opsi 1)
* **Pemasukan (Gross Revenue)**: Total akumulasi `lineTotalMinor` dari pesanan berstatus `PAID`.
* **Pengeluaran Otomatis (Platform Fee)**: Potongan gateway & admin platform dipatok otomatis sebesar **`3.0%`** (`lineTotalMinor * 0.03`).
* **Laba Bersih**: `Pemasukan - Pengeluaran`.
* **Periode Tersedia**:
  - Harian: 7 hari terakhir.
  - Mingguan: 8 minggu terakhir.
  - Tahunan: 12 bulan terakhir.

---

## 4. Progress & Current State (Komponen yang Sudah Selesai)

1. **Multi-Seller Data Layer (Batch 1–4 Selesai)**:
   - Skema Prisma diperbarui (`sellerId` pada `Product` dan relasi ke `User`).
   - Helper data terisolasi di `src/lib/admin/seller-metrics.ts`.
   - Isolasi katalog produk di `/admin/products` dan transaksi di `/admin/orders`.
2. **Chart Arus Kas & Analitik Keuangan**:
   - `src/lib/admin/financial-analytics.ts`: Mesin agregasi waktu & kalkulasi otomatis fee 3%.
   - `src/components/admin/financial-chart.tsx`: Visualisasi grafik ganda (Pemasukan vs Potongan) + tabel audit buku kas tanpa dependency eksternal.
   - Terintegrasi penuh di `src/app/admin/page.tsx`.
3. **Penyempurnaan Tampilan Beranda & Foto**:
   - `src/app/page.tsx`: Mengatasi bug foto terpotong setengah dengan rasio `aspect-[4/3]` dan `object-cover object-top`.
4. **Navigasi Download Center (Phase 6 / Batch 2)**:
   - Link *Download center* (`/account/downloads`) aktif di dropdown desktop (`account-menu.tsx`) dan menu mobile (`mobile-nav.tsx`).
5. **Autentikasi Google OAuth**:
   - `src/lib/auth.ts`: Dukungan multi-alias env variable dan validasi ketat `AUTH_SECRET`.
   - Setup Google Cloud Console untuk dual-origin (`localhost` & `eincshop.vercel.app`).
6. **Mobile Hamburger Button Morphing**:
   - `src/components/layout/mobile-nav.tsx`: 3 baris garis dengan animasi morphing presisi 300ms ke silang 'X' menggunakan CSS group-open murni tanpa hydration glitch.

---

## 5. Agent Rules (Aturan Wajib Kodingan Selanjutnya)

Setiap agen/asisten yang melanjutkan task di proyek ini **WAJIB** mematuhi aturan berikut:

1. **Strict Read-Only Mode**:
   - **DILARANG** menjalankan terminal commands atau menulis/mengedit berkas secara langsung di disk tanpa instruksi eksplisit.
   - Selalu berikan kode dalam format **Full Drop-in Replacement** utuh di chat agar pengguna bisa menyalin tanpa risiko baris kode terputus.
2. **Security Boundary**:
   - **STRICTLY FORBIDDEN** membaca, membuka, melihat, atau menampilkan isi berkas `.env` dan rahasia kredensial lainnya.
3. **Zero Dependency Bloat**:
   - Jangan memasang library visualisasi berat (seperti Chart.js, Recharts, dll.) jika kebutuhan visual dapat dipecahkan dengan SVG/CSS Tailwind yang murni dan ringan.
4. **No Cookie-Cutter / Template Design**:
   - Jaga konsistensi estetika editorial, warna berbasis variabel canvas/ink, tipografi tracking presisi, dan border halus.
5. **Mobile-First Accessibility**:
   - Setiap tombol interaktif wajib memenuhi batas sentuh `min-h-11 min-w-11` (44px) dan dilengkapi atribut ARIA yang valid.
6. **No Breaking Changes**:
   - Jangan mengubah logika Prisma yang sudah stabil atau mengganti skema basis data tanpa migrasi formal. Selalu ikuti pola *Direct Indexed Scalar Query*.

---

*File konteks ini adalah ringkasan permanen yang dapat Anda simpan sebagai `PROJECT_CONTEXT.md` di root proyek untuk menjaga kelangsungan pengembangan berikutnya.*