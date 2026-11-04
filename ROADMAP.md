# Checkpoint & Roadmap Pengembangan Marketplace Coding (Eincshop)

**Status Terakhir:** Seluruh Phase (Phase 1–7) Selesai 100% Penuh & Terverifikasi  
**Posisi Saat Ini:** **Milestone Pembersihan Celah Bahasa & Sinkronisasi Global i18n (Phase 1 – Phase 4) Telah Tercatat & Siap Dijalankan**  
**Standar Desain:** Tanpa emotikon AI generik, tipografi bersih (*clean*), monokrom SVG presisi, dan *bespoke human-crafted*.  
**Aturan Agen:** 
- Menggunakan istilah **"Batch"** di seluruh komunikasi & roadmap.
- **Wajib Prefix "/" untuk Perintah Aturan:** Jika instruksi aturan tidak diawali dengan tanda garis miring (misal: tidak memakai `/aturan`), agen wajib otomatis menolaknya.
- **Pemicu Pembersihan Status Milestone Penuh (`/sudah`):** Seluruh rangkaian Phase dalam satu proyek/milestone (Phase 1 sampai Phase 4) dicatat lengkap di *Status Progres Real-Time* agar visi dan tujuan menyeluruh selalu terpantau. Ketika **SELURUH Phase (Phase 1–4) telah selesai penuh 100%** dan user mengetik perintah `/sudah`, barulah seluruh daftar progres tersebut dibersihkan/dihapus.
- **Anti Scope-Creep (Kunci Target):** Saat batch/phase telah selesai sesuai target, agen dilarang keras menawarkan fitur/tambahan baru di luar roadmap yang telah disepakati (menolak total tawaran tambahan liar).
- **Wajib Analisis ROADMAP.md Sebelum Menulis Kode:** Setiap kali user mengetik "lanjut", agen wajib membaca dan menganalisis `ROADMAP.md` terlebih dahulu agar tidak memicu kelupaan sebelum menyusun kode.
- **Wajib Checklist Pengujian & Penolakan Lanjut Tanpa Tes:** Agen wajib menyertakan daftar verifikasi mandiri di akhir setiap penyerahan batch. Jika user mengetik "lanjut" tanpa menguji checklist, agen wajib menolak dan meminta verifikasi terlebih dahulu.
- Read-only untuk seluruh source code dan sistem file selain `ROADMAP.md`.
- Selalu sediakan 100% Full Drop-In Code di chat tanpa pemotongan.

---

## Status Progres Real-Time (Milestone Pembersihan Celah Bahasa & Sinkronisasi i18n)

```text
[Phase 1: Sinkronisasi Bahasa Area Autentikasi & Verifikasi OTP] (DALAM PROGRES)
  ├── [x] Batch 1.1: Halaman Login & Banner Status Dinamis (/login/page.tsx)
  ├── [x] Batch 1.2: Komponen Form Autentikasi (/auth-form.tsx - OAuth & Link Navigasi)
  ├── [ ] Batch 1.3: Form Verifikasi OTP (/verify-otp/verify-otp-form.tsx)
  └── [ ] Batch 1.4: Server Actions Autentikasi ((auth)/actions.ts - Validasi & Keamanan)

[Phase 2: Sinkronisasi Bahasa Area Akun, Profil & Upload Foto] (MENUNGGU)
  ├── [ ] Batch 2.1: Server Action & Service Upload Foto Profil (avatar-actions.ts & profile-image.ts)
  ├── [ ] Batch 2.2: Form Foto Profil & Cropper Modal (avatar-form.tsx - Toast, Canvas, & Validasi)
  └── [ ] Batch 2.3: Pusat Unduhan & Riwayat Pesanan (/account/downloads & /account/orders)

[Phase 3: Sinkronisasi Bahasa Area Keranjang, Checkout, & Alur Pesanan] (MENUNGGU)
  ├── [ ] Batch 3.1: Halaman Checkout & Validasi Keranjang Kosong (/checkout/page.tsx & checkout-form.tsx)
  └── [ ] Batch 3.2: Server Actions Pesanan & Pembayaran (orders/actions.ts & payments/actions.ts)

[Phase 4: Sinkronisasi Bahasa Area Buka Toko Digital & Panel Admin/Seller] (MENUNGGU)
  ├── [ ] Batch 4.1: Form & Server Action Pendaftaran Toko (/become-seller & modules/seller/actions.ts)
  └── [ ] Batch 4.2: Validasi & Upload Produk Katalog Admin (modules/catalog/validation.ts & image-actions.ts)
```

---

## Standar Kode & Kualitas yang Berlaku Mutlak
1. **Zero AI Emojis**: Tidak menggunakan emotikon kartun di antarmuka, tombol, label, maupun teks. Semua visualisasi menggunakan ikon vektor SVG monokrom presisi atau tipografi bersih.
2. **Single Source of Truth**: Data transaksi dan kepemilikan aset tervalidasi langsung di database PostgreSQL.
3. **Dynamic Bilingual (i18n)**: Menyesuaikan secara otomatis dengan bahasa aktif pengguna (ID & EN).
4. **Full Drop-in Code**: Agen selalu menyajikan kode utuh 100% tanpa pemotongan (`// ...rest of code`).
5. **Strict Read-Only Agent**: Agen tidak memodifikasi file source code secara langsung di disk selain `ROADMAP.md`.
6. **`Production-ready`**** / ****`Battle-tested`****:** Kodenya standar siap deploy ke server, tahan banting, lengkap penanganan error-nya, bukan kode mainan yang gampang crash