<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KdsController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\StokController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PembelianController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\PromoController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\AbsensiAdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\PublicCafeController;
use App\Http\Controllers\ReservasiController;
use App\Http\Controllers\DeveloperTelemetryController;

/*
|--------------------------------------------------------------------------
| Web Routes - Jelang Hari POS & ERP
| Hardened against Kali Linux Penetration Testing & OWASP Top 10
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. PUBLIC ROUTES (RATE-LIMITED & SANITIZED)
// ==========================================
Route::get('/', [PublicCafeController::class, 'index'])->name('home');
Route::get('/meja/{nomor}', function ($nomor) {
    return redirect('/?meja=' . urlencode(strip_tags((string)$nomor)));
})->name('public.meja.direct');
Route::get('/tentang', [PublicCafeController::class, 'about'])->name('about');
Route::get('/api/store-status', [PublicCafeController::class, 'storeStatus'])->name('public.store.status');

// Anti-Spam / Anti-DDoS Throttling on Public Endpoints
Route::post('/api/pesan-online', [PublicCafeController::class, 'customerOrder'])
    ->middleware('throttle:20,1')
    ->name('customer.order');

Route::get('/api/track-order', [PublicCafeController::class, 'trackOrder'])->name('customer.track');
Route::get('/api/my-orders', [PublicCafeController::class, 'myOrders'])->name('customer.my-orders');

Route::post('/api/voucher/check', [KasirController::class, 'checkVoucher'])
    ->middleware('throttle:15,1')
    ->name('public.voucher.check');

Route::get('/struk/{nomor_pesanan}', [KasirController::class, 'publicStruk'])->name('public.struk');

Route::post('/api/reservasi', [PublicCafeController::class, 'submitReservation'])
    ->middleware('throttle:10,1')
    ->name('public.reservasi.submit');

Route::post('/api/midtrans/notification', [PublicCafeController::class, 'midtransNotification'])
    ->name('midtrans.notification');

Route::post('/api/pesanan/{nomor_pesanan}/snap-token', [PublicCafeController::class, 'getSnapToken'])
    ->middleware('throttle:20,1')
    ->name('customer.snap-token');

Route::post('/dashboard/ai-chat', [DashboardController::class, 'aiChat'])
    ->middleware('throttle:20,1')
    ->name('dashboard.ai-chat');


// ==========================================================
// 2. AUTHENTICATED ROUTES (ROLE-BASED ACCESS CONTROL - RBAC)
// ==========================================================
Route::middleware(['auth'])->group(function () {

    // --- POS & KASIR (Owner, Manager, Kasir) ---
    Route::middleware(['role:owner,manager,kasir'])->group(function () {
        Route::get('/kasir', [KasirController::class, 'index'])->name('kasir.index');
        Route::get('/kasir/customers', [KasirController::class, 'customers'])->name('kasir.customers');
        Route::post('/kasir/customers', [KasirController::class, 'quickRegisterCustomer'])->name('kasir.customers.create');
        Route::post('/kasir/checkout', [KasirController::class, 'checkout'])->name('kasir.checkout');
        Route::get('/kasir/struk/{pesanan}', [KasirController::class, 'strukJson'])->name('kasir.struk.json');
        Route::post('/kasir/voucher/check', [KasirController::class, 'checkVoucher'])->name('kasir.voucher.check');
        Route::get('/kasir/riwayat', [KasirController::class, 'riwayatPesanan'])->name('kasir.riwayat');
        Route::get('/kasir/shift-riwayat', [KasirController::class, 'riwayatShift'])->name('kasir.shift.riwayat');

        // Shift Kasir
        Route::get('/shift', [ShiftController::class, 'index'])->name('shift.index');
        Route::post('/shift/buka', [ShiftController::class, 'bukaShift'])->name('shift.buka');
        Route::post('/shift/{shift}/tutup', [ShiftController::class, 'tutupShift'])->name('shift.tutup');

        // Riwayat Transaksi & Struk (View & Print)
        Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi.index');
        Route::get('/transaksi/{pesanan}', [TransaksiController::class, 'show'])->name('transaksi.show');
        Route::get('/transaksi/{pesanan}/print', [TransaksiController::class, 'print'])->name('transaksi.print');
    });

    // --- KITCHEN & BARISTA DISPLAY SYSTEM (KDS) ---
    Route::middleware(['role:owner,manager,barista,kitchen,kasir'])->group(function () {
        Route::get('/kds', [KdsController::class, 'index'])->name('kds.index');
        Route::get('/kds/fetch', [KdsController::class, 'fetchOrders'])->name('kds.fetch');
        Route::patch('/kds/item/{item}/status', [KdsController::class, 'updateItemStatus'])->name('kds.item.status');
        Route::patch('/kds/order/{pesanan}/status', [KdsController::class, 'updateOrderStatus'])->name('kds.order.status');
        Route::patch('/kds/order/{pesanan}/complete', [KdsController::class, 'completeOrder'])->name('kds.order.complete');
        Route::patch('/kds/order/{pesanan}/reopen', [KdsController::class, 'reopenOrder'])->name('kds.order.reopen');
        Route::patch('/kds/order/{pesanan}/cancel', [KdsController::class, 'cancelOrder'])->name('kds.order.cancel');
        Route::post('/kds/resep/{produk}', [KdsController::class, 'updateResep'])->name('kds.resep.update');
        Route::get('/kds/resep/{produk}', [KdsController::class, 'getResep'])->name('kds.resep.get');
    });

    // --- ABSENSI SELF-SERVICE (Staff Kafe) ---
    Route::middleware(['role:owner,manager,kasir,barista,kitchen'])->group(function () {
        Route::get('/absensi', [AbsensiController::class, 'index'])->name('absensi.index');
        Route::post('/absensi/clock-in', [AbsensiController::class, 'clockIn'])->name('absensi.clock-in');
        Route::post('/absensi/clock-out', [AbsensiController::class, 'clockOut'])->name('absensi.clock-out');
        Route::get('/absensi/riwayat', [AbsensiController::class, 'riwayat'])->name('absensi.riwayat');
        Route::get('/absensi/izin', [AbsensiController::class, 'formIzin'])->name('absensi.izin');
        Route::post('/absensi/izin', [AbsensiController::class, 'ajukanIzin'])->name('absensi.izin.store');
    });

    // --- EXECUTIVE ADMIN & OWNER CONTROLS (Owner & Manager Only) ---
    Route::middleware(['role:owner,manager'])->group(function () {
        // Dashboard Analytics
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Void Order (Tindakan finansial kritis)
        Route::post('/transaksi/{pesanan}/void', [TransaksiController::class, 'voidOrder'])->name('transaksi.void');

        // Produk & Menu Cafe
        Route::get('/produk', [ProdukController::class, 'index'])->name('produk.index');
        Route::get('/produk/create', [ProdukController::class, 'create'])->name('produk.create');
        Route::post('/produk', [ProdukController::class, 'store'])->name('produk.store');
        Route::get('/produk/{produk}/edit', [ProdukController::class, 'edit'])->name('produk.edit');
        Route::post('/produk/{produk}', [ProdukController::class, 'update'])->name('produk.update');
        Route::delete('/produk/{produk}', [ProdukController::class, 'destroy'])->name('produk.destroy');
        Route::patch('/produk/{produk}/toggle', [ProdukController::class, 'toggleTersedia'])->name('produk.toggle');

        // Kategori Menu
        Route::get('/kategori', [KategoriController::class, 'index'])->name('kategori.index');
        Route::post('/kategori', [KategoriController::class, 'store'])->name('kategori.store');
        Route::put('/kategori/{kategori}', [KategoriController::class, 'update'])->name('kategori.update');
        Route::delete('/kategori/{kategori}', [KategoriController::class, 'destroy'])->name('kategori.destroy');
        Route::patch('/kategori/{kategori}/toggle', [KategoriController::class, 'toggle'])->name('kategori.toggle');

        // Inventori, Bahan Baku & Resep
        Route::get('/stok/bahan-baku', [StokController::class, 'bahanBaku'])->name('stok.bahan-baku');
        Route::post('/stok/bahan-baku', [StokController::class, 'storeBahanBaku'])->name('stok.bahan-baku.store');
        Route::put('/stok/bahan-baku/{bahanBaku}', [StokController::class, 'updateBahanBaku'])->name('stok.bahan-baku.update');
        Route::delete('/stok/bahan-baku/{bahanBaku}', [StokController::class, 'destroyBahanBaku'])->name('stok.bahan-baku.destroy');
        Route::post('/stok/bahan-baku/{bahanBaku}/penyesuaian', [StokController::class, 'penyesuaian'])->name('stok.bahan-baku.penyesuaian');
        Route::get('/stok/resep', [StokController::class, 'resep'])->name('stok.resep');
        Route::post('/stok/resep/{produk}', [StokController::class, 'updateResep'])->name('stok.resep.update');
        Route::get('/stok/supplier', [SupplierController::class, 'index'])->name('stok.supplier');
        Route::post('/stok/supplier', [SupplierController::class, 'store'])->name('stok.supplier.store');
        Route::put('/stok/supplier/{supplier}', [SupplierController::class, 'update'])->name('stok.supplier.update');
        Route::delete('/stok/supplier/{supplier}', [SupplierController::class, 'destroy'])->name('stok.supplier.destroy');
        Route::get('/stok/pembelian', [PembelianController::class, 'index'])->name('stok.pembelian');
        Route::post('/stok/pembelian', [PembelianController::class, 'store'])->name('stok.pembelian.store');

        // Pelanggan & CRM
        Route::get('/customer', [CustomerController::class, 'index'])->name('customer.index');
        Route::post('/customer', [CustomerController::class, 'store'])->name('customer.store');
        Route::put('/customer/{customer}', [CustomerController::class, 'update'])->name('customer.update');
        Route::delete('/customer/{customer}', [CustomerController::class, 'destroy'])->name('customer.destroy');

        // Voucher Diskon
        Route::get('/voucher', [VoucherController::class, 'index'])->name('voucher.index');
        Route::post('/voucher', [VoucherController::class, 'store'])->name('voucher.store');
        Route::put('/voucher/{voucher}', [VoucherController::class, 'update'])->name('voucher.update');
        Route::delete('/voucher/{voucher}', [VoucherController::class, 'destroy'])->name('voucher.destroy');
        Route::patch('/voucher/{voucher}/toggle', [VoucherController::class, 'toggle'])->name('voucher.toggle');

        // Promo & Diskon Waktu
        Route::get('/promo', [PromoController::class, 'index'])->name('promo.index');
        Route::post('/promo', [PromoController::class, 'store'])->name('promo.store');
        Route::put('/promo/{promo}', [PromoController::class, 'update'])->name('promo.update');
        Route::delete('/promo/{promo}', [PromoController::class, 'destroy'])->name('promo.destroy');
        Route::patch('/promo/{promo}/toggle', [PromoController::class, 'toggle'])->name('promo.toggle');

        // Laporan Penjualan & Ekspor Finansial
        Route::get('/laporan/harian', [LaporanController::class, 'harian'])->name('laporan.harian');
        Route::get('/laporan/produk', [LaporanController::class, 'produk'])->name('laporan.produk');
        Route::get('/laporan/export-excel', [LaporanController::class, 'exportExcel'])->name('laporan.export.excel');
        Route::get('/laporan/export-pdf', [LaporanController::class, 'exportPdf'])->name('laporan.export.pdf');

        // Karyawan & Staff (Owner & Manager)
        Route::get('/user', [UserController::class, 'index'])->name('user.index');
        Route::post('/user', [UserController::class, 'store'])->name('user.store');
        Route::put('/user/{user}', [UserController::class, 'update'])->name('user.update');
        Route::delete('/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');
        Route::patch('/user/{user}/toggle', [UserController::class, 'toggle'])->name('user.toggle');

        // Pengaturan Sistem & Meja
        Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan.index');
        Route::post('/pengaturan', [PengaturanController::class, 'update'])->name('pengaturan.update');
        Route::get('/pengaturan/meja', [PengaturanController::class, 'index']);
        Route::post('/pengaturan/meja', [PengaturanController::class, 'storeMeja'])->name('pengaturan.meja.store');
        Route::put('/pengaturan/meja/{meja}', [PengaturanController::class, 'updateMeja'])->name('pengaturan.meja.update');
        Route::delete('/pengaturan/meja/{meja}', [PengaturanController::class, 'destroyMeja'])->name('pengaturan.meja.destroy');
        Route::get('/panduan/data', [PengaturanController::class, 'getPanduan'])->name('panduan.get');
        Route::post('/panduan/data', [PengaturanController::class, 'savePanduan'])->name('panduan.save');

        // Manajemen Reservasi Meja & Workspace
        Route::get('/reservasi', [ReservasiController::class, 'index'])->name('reservasi.index');
        Route::post('/reservasi', [ReservasiController::class, 'store'])->name('reservasi.store');
        Route::put('/reservasi/{reservasi}', [ReservasiController::class, 'update'])->name('reservasi.update');
        Route::patch('/reservasi/{reservasi}/status', [ReservasiController::class, 'updateStatus'])->name('reservasi.status');
        Route::delete('/reservasi/{reservasi}', [ReservasiController::class, 'destroy'])->name('reservasi.destroy');
        Route::post('/reservasi/pengaturan', [ReservasiController::class, 'updateSettings'])->name('reservasi.settings');

        // Absensi Admin & Rekapitulasi
        Route::get('/absensi/admin', [AbsensiAdminController::class, 'index'])->name('absensi.admin');
        Route::get('/absensi/admin/rekap', [AbsensiAdminController::class, 'rekap'])->name('absensi.admin.rekap');
        Route::get('/absensi/admin/detail/{user_id}', [AbsensiAdminController::class, 'detail'])->name('absensi.admin.detail');
        Route::post('/absensi/admin/approve/{id}', [AbsensiAdminController::class, 'approve'])->name('absensi.admin.approve');
        Route::post('/absensi/admin/reject/{id}', [AbsensiAdminController::class, 'reject'])->name('absensi.admin.reject');
        Route::get('/absensi/admin/export', [AbsensiAdminController::class, 'export'])->name('absensi.admin.export');
        Route::get('/absensi/admin/pengaturan', [AbsensiAdminController::class, 'pengaturan'])->name('absensi.admin.pengaturan');
        Route::post('/absensi/admin/pengaturan', [AbsensiAdminController::class, 'updatePengaturan'])->name('absensi.admin.pengaturan.update');
    });

    // --- PROFIL PENGGUNA (Semua User Login) ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- PORTAL & DASHBOARD KHUSUS PELANGGAN / MEMBER ---
    Route::get('/user/dashboard', [CustomerDashboardController::class, 'index'])->name('user.dashboard');
    Route::post('/user/profile', [CustomerDashboardController::class, 'updateProfile'])->name('user.profile.update');
    Route::put('/user/password', [CustomerDashboardController::class, 'updatePassword'])->name('user.password.update');
    Route::post('/user/reserve', [CustomerDashboardController::class, 'reserveWorkspace'])->name('user.reserve');
    Route::redirect('/member/dashboard', '/user/dashboard');

    // Redirect Shortcuts
    Route::redirect('/supplier', '/stok/supplier');
    Route::redirect('/pembelian', '/stok/pembelian');
    Route::redirect('/bahan-baku', '/stok/bahan-baku');
    Route::redirect('/resep', '/stok/resep');
});

// --- SECRET DEVELOPER TELEMETRY (Hidden from Client & Public) ---
Route::get('/dev-monitor', [DeveloperTelemetryController::class, 'index'])->name('dev.monitor');
Route::post('/dev-monitor/clear', [DeveloperTelemetryController::class, 'clear'])->name('dev.monitor.clear');

require __DIR__.'/auth.php';
