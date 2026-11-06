# Jelang Hari POS — Pembaruan Sistem Menyeluruh dari Nol

Sistem POS & Web Manajemen Cafe **Jelang Hari Coffee & Workspace** telah dibangun ulang dari nol (**clean slate**) menggantikan sistem lama Nutapos dan file PHP prosedural legacy. Seluruh folder dan file telah ditata rapi dengan arsitektur modern: **Laravel 12 (PHP 8.2)** di backend dan **React 18 + Inertia.js + TypeScript + Vite + Tailwind CSS 3** di frontend.

---

## 1. Arsitektur & Teknologi

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Backend Framework** | Laravel 12.69 (PHP 8.2) | RESTful Controller, Eloquent ORM, Service Layer, Pest Testing |
| **Frontend Framework** | React 18 + TypeScript | Komponen reaktif berbasis TypeScript, State Management Zustand |
| **Adapter & Routing** | Inertia.js v2 | Single Page Application (SPA) mulus tanpa reload halaman |
| **Styling** | Tailwind CSS v3.4 | Palet khusus Jelang Hari (Monochrome Charcoal, Stone & Warm Tan Accent) |
| **Icons & Charts** | Lucide React + Recharts | Visualisasi data penjualan harian & omset kafe interaktif |
| **Database** | MySQL 8.0 (`jelanghari_db`) | Relasi lengkap: Produk, Resep Bahan Baku, Meja, Pesanan, KDS, Shift, Audit |
| **Build Tooling** | Node.js (v22) + Vite v6 | Kompilasi kilat hot-module replacement (HMR) & production bundle |

---

## 2. Struktur Folder & Berkas yang Telah Dirapihkan

```
C:\laragon\www\jelanghari\
├── app/
│   ├── Helpers/
│   │   └── Format.php                    # Format mata uang Rupiah & tanggal Indonesia
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── KasirController.php       # Layar kasir POS, checkout, kalkulasi diskon & voucher
│   │   │   ├── DashboardController.php   # Metrik omset, grafik 7 hari, top produk, meja terisi
│   │   │   ├── TransaksiController.php   # Riwayat nota, cetak thermal ESC/POS, void transaksi
│   │   │   ├── ProdukController.php      # CRUD produk, upload foto, varian, dan modifier
│   │   │   ├── KategoriController.php    # Manajemen kategori menu kafe
│   │   │   ├── KdsController.php         # Kitchen & Barista Display System (antrean pesanan)
│   │   │   ├── LaporanController.php     # Laporan harian, rincian per jam & performa produk
│   │   │   ├── ShiftController.php       # Buka/tutup shift kasir, laci kas, rekonsiliasi selisih
│   │   │   ├── StokController.php        # Manajemen stok bahan baku, opname, matriks resep
│   │   │   ├── SupplierController.php    # Data vendor & pemasok bahan kafe
│   │   │   ├── PembelianController.php   # PO pembelian bahan & restock otomatis
│   │   │   ├── CustomerController.php    # CRM & database loyalitas pelanggan
│   │   │   ├── VoucherController.php     # Manajemen kupon diskon & kuota pemakaian
│   │   │   ├── PromoController.php       # Promo berkala (Happy Hour, Diskon Jam)
│   │   │   ├── UserController.php        # Manajemen staf & hak akses (Owner, Kasir, dll)
│   │   │   ├── PengaturanController.php  # Konfigurasi kafe, pajak PB1, printer, WiFi & meja
│   │   │   └── AbsensiController.php     # Catatan kehadiran staf (Clock-in / Clock-out)
│   │   └── Middleware/
│   │       └── RoleMiddleware.php        # Proteksi hak akses berbasis peran pengguna
│   ├── Models/                           # 23 Eloquent Models lengkap dengan relasi & casts
│   └── Services/
│       ├── StockService.php              # Pengurangan bahan baku otomatis saat pesanan dibuat
│       └── PrinterService.php            # Generator ESC/POS thermal 58mm/80mm
├── database/
│   ├── migrations/                       # 10 file migrasi tabel MySQL
│   └── seeders/                          # Data demo siap pakai (menu, meja, resep, akun staf)
├── resources/
│   ├── css/
│   │   └── app.css                       # Desain sistem Jelang Hari & Tailwind directives
│   ├── js/
│   │   ├── Components/
│   │   │   └── Kasir/                    # Komponen modular kasir POS
│   │   │       ├── CartPanel.tsx         # Panel keranjang belanja & ringkasan subtotal
│   │   │       ├── CategoryFilter.tsx    # Filter kategori horizontal
│   │   │       ├── PaymentModal.tsx      # Modal pembayaran (Tunai, QRIS, Debit, Transfer)
│   │   │       ├── ProdukCard.tsx        # Kartu menu dengan badge stok & favorit
│   │   │       ├── StrukPreviewModal.tsx # Pratinjau struk kasir & cetak WebUSB/Bluetooth
│   │   │       ├── TableModal.tsx        # Pemilihan meja (Indoor, Outdoor, Workspace)
│   │   │       └── VariantModifierModal.tsx # Pilihan varian & kustomisasi pesanan
│   │   ├── Layouts/
│   │   │   ├── AppLayout.tsx             # Sidebar navigasi Jelang Hari & header terintegrasi
│   │   │   ├── KasirLayout.tsx           # Layout full-screen khusus operasional kasir cepat
│   │   │   └── AuthLayout.tsx            # Halaman otentikasi login bergaya elegan
│   │   ├── lib/
│   │   │   ├── format.ts                 # Formatter format Rupiah & tanggal Indonesia
│   │   │   └── printer.ts                # Driver printer thermal WebUSB & Bluetooth ESC/POS
│   │   ├── Pages/                        # 17 halaman React lengkap
│   │   │   ├── Kasir/Index.tsx           # Layar kasir POS utama
│   │   │   ├── Dashboard/Index.tsx       # Dashboard analitik bisnis kafe
│   │   │   ├── Kds/Index.tsx             # Kitchen & Barista Display System
│   │   │   ├── Transaksi/                # Riwayat pesanan & detail struk
│   │   │   ├── Produk/                   # Katalog menu & form input produk
│   │   │   ├── Kategori/Index.tsx        # Pengaturan kategori menu
│   │   │   ├── Stok/                     # Bahan baku, resep, supplier & pembelian
│   │   │   ├── Shift/Index.tsx           # Shift kasir & penutupan laci kas
│   │   │   ├── Laporan/                  # Laporan harian & analisis produk terlaris
│   │   │   ├── Customer/Index.tsx        # Data pelanggan & riwayat kunjungan
│   │   │   ├── Voucher/Index.tsx         # Kupon diskon & batas promo
│   │   │   ├── Promo/Index.tsx           # Promo waktu tertentu (Happy Hour)
│   │   │   ├── User/Index.tsx            # Data staf kafe
│   │   │   ├── Pengaturan/Index.tsx      # Pengaturan kafe, printer & denah meja
│   │   │   └── Absensi/Index.tsx         # Kehadiran staf
│   │   └── Stores/
│   │       └── cartStore.ts              # Zustand cart store untuk kasir
│   └── views/
│       └── app.blade.php                 # Root Inertia Blade dengan Google Fonts & CSS
├── routes/
│   └── web.php                           # 89 endpoints rute terstruktur
└── _legacy_backup/                       # File PHP lama disimpan aman di sini
```

---

## 3. Akun Pengguna Demo yang Siap Digunakan

Database MySQL `jelanghari_db` telah terisi dengan akun bawaan untuk pengujian:

| Role / Jabatan | Email Login | Password | PIN Cepat | Akses Utama |
|---|---|---|---|---|
| **Owner** | `owner@jelanghari.com` | `password` | `123456` | Seluruh fitur, laporan laba rugi, pengaturan |
| **Manager** | `manager@jelanghari.com` | `password` | `123456` | Stok bahan, pembelian supplier, shift kasir |
| **Kasir** | `kasir@jelanghari.com` | `password` | `112233` | Layar POS kasir, pembayaran, buka/tutup shift |
| **Barista** | `barista@jelanghari.com` | `password` | `112233` | Antrean KDS Barista (pesanan minuman) |
| **Kitchen** | `kitchen@jelanghari.com` | `password` | `112233` | Antrean KDS Dapur (pesanan makanan) |

---

## 4. Panduan Menjalankan Sistem

Aplikasi terhubung langsung dengan Node.js (Vite) dan Laragon:

### 1. Menjalankan Server Laravel (PHP)
Buka terminal di `c:\laragon\www\jelanghari` dan jalankan:
```bash
php artisan serve
```
Aplikasi dapat diakses di browser melalui: **`http://localhost:8000`** atau host Laragon **`http://jelanghari.test`**.

### 2. Menjalankan Server Vite Frontend (Live Development HMR)
Jika Anda ingin mengembangkan tampilan React dengan reload otomatis seketika:
```bash
npm run dev
```

### 3. Kompilasi Production Bundle
Frontend telah dikompilasi secara optimal menggunakan Vite:
```bash
npm run build
```
*(Seluruh aset CSS dan JS telah terkompilasi sempurna di folder `public/build/`).*

### 4. Menjalankan Pengujian Otomatis (Testing)
```bash
php artisan test
```
*Hasil pengujian: **27 passed (65 assertions)**.*
