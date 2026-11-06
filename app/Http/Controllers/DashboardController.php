<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\Produk;
use App\Models\BahanBaku;
use App\Models\Meja;
use App\Models\ShiftKasir;
use App\Models\Supplier;
use App\Models\Voucher;
use App\Models\User;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user && $user->role === 'pelanggan') {
            return redirect('/');
        }

        $today = Carbon::today();

        // 1. Daily Metrics
        $totalPenjualanHariIni = Pesanan::whereDate('created_at', $today)
            ->where('status_pembayaran', 'paid')
            ->sum('total');

        $totalTransaksiHariIni = Pesanan::whereDate('created_at', $today)
            ->where('status_pembayaran', 'paid')
            ->count();

        $mejaTerisi = Meja::where('status', 'terisi')->count();
        $totalMeja = Meja::where('is_aktif', true)->count();

        $stokMenipisCount = BahanBaku::whereColumn('stok', '<=', 'min_stok')->count()
            + Produk::where('kelola_stok', true)->whereColumn('stok', '<=', 'min_stok')->count();

        // 2. Sales Chart (Last 7 Days)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayName = $date->locale('id')->isoFormat('dddd');
            $sales = Pesanan::whereDate('created_at', $date)
                ->where('status_pembayaran', 'paid')
                ->sum('total');

            $chartData[] = [
                'hari' => $dayName,
                'tanggal' => $date->format('d/m'),
                'total' => (float) $sales,
            ];
        }

        // 3. Recent Transactions
        $recentOrders = Pesanan::with(['meja', 'user'])
            ->latest()
            ->take(5)
            ->get();

        // 4. Top Selling Products
        $topProducts = DB::table('detail_pesanans')
            ->select('nama_produk', DB::raw('SUM(jumlah) as total_terjual'), DB::raw('SUM(subtotal) as total_omset'))
            ->groupBy('nama_produk')
            ->orderByDesc('total_terjual')
            ->limit(5)
            ->get();

        // Format recent transactions
        $formattedRecent = $recentOrders->map(function ($order) {
            return [
                'id' => $order->id,
                'no_struk' => $order->nomor_pesanan,
                'pelanggan' => $order->nama_pelanggan ?: 'Walk-in Guest',
                'total' => (float) $order->total,
                'metode_bayar' => $order->metode_pembayaran ?: 'cash',
                'status' => $order->status_pembayaran === 'paid' ? 'Lunas' : $order->status_pembayaran,
                'waktu' => $order->created_at ? $order->created_at->format('H:i') : '-',
            ];
        });

        $avgOrder = $totalTransaksiHariIni > 0 ? round($totalPenjualanHariIni / $totalTransaksiHariIni) : 0;
        $labaKotor = round($totalPenjualanHariIni * 0.65); // Estimasi 65% gross margin cafe

        $statsData = [
            'penjualan_hari_ini' => (float) $totalPenjualanHariIni,
            'transaksi_hari_ini' => $totalTransaksiHariIni,
            'avg_order' => (float) $avgOrder,
            'laba_kotor' => (float) $labaKotor,
        ];

        $activeShift = ShiftKasir::where('user_id', auth()->id())
            ->where('status', 'aktif')
            ->first();

        $lowStockList = BahanBaku::whereColumn('stok', '<=', 'min_stok')
            ->orderBy('stok', 'asc')
            ->limit(5)
            ->get(['id', 'nama', 'stok', 'min_stok', 'satuan']);

        return Inertia::render('Dashboard/Index', [
            'stats' => $statsData,
            'chart_sales' => $chartData,
            'transaksi_terbaru' => $formattedRecent,
            'metrics' => [
                'penjualan_hari_ini' => (float) $totalPenjualanHariIni,
                'transaksi_hari_ini' => $totalTransaksiHariIni,
                'meja_terisi' => $mejaTerisi,
                'total_meja' => $totalMeja,
                'stok_menipis' => $stokMenipisCount,
            ],
            'chartData' => $chartData,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'lowStockList' => $lowStockList,
            'low_stock_list' => $lowStockList,
            'activeShift' => $activeShift,
        ]);
    }

    public function aiChat(Request $request)
    {
        $rawPrompt = trim($request->input('prompt', ''));
        $prompt = strtolower($rawPrompt);
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // 1. Data Store Terkini & Akurat
        $salesToday = (float) Pesanan::whereDate('created_at', $today)->where('status_pembayaran', 'paid')->sum('total');
        $countToday = Pesanan::whereDate('created_at', $today)->where('status_pembayaran', 'paid')->count();
        $salesYesterday = (float) Pesanan::whereDate('created_at', $yesterday)->where('status_pembayaran', 'paid')->sum('total');
        
        $aov = $countToday > 0 ? round($salesToday / $countToday) : 0;
        $growthText = '';
        if ($salesYesterday > 0) {
            $diffPercent = round((($salesToday - $salesYesterday) / $salesYesterday) * 100);
            $growthText = ($diffPercent >= 0 ? "+{$diffPercent}%" : "{$diffPercent}%") . " vs kemarin";
        }

        // 2. Status Antrean KDS (Kitchen & Barista)
        $kdsPending = Pesanan::whereDate('created_at', $today)
            ->whereIn('status_pesanan', ['menunggu', 'diproses'])
            ->count();

        // 3. Status Meja Terisi
        $mejaTerisi = Meja::where('status', 'terisi')->count();
        $totalMeja = Meja::where('is_aktif', true)->count();

        // 4. Status Shift Kasir
        $activeShift = ShiftKasir::with('user')->where('status', 'aktif')->first();

        // 5. Bahan Baku Kritis
        $lowMaterials = BahanBaku::whereColumn('stok', '<=', 'min_stok')
            ->orderBy('stok', 'asc')
            ->limit(4)
            ->get(['nama', 'stok', 'satuan', 'min_stok']);

        // 6. Produk Terlaris
        $top = DB::table('detail_pesanans')
            ->select('nama_produk', DB::raw('SUM(jumlah) as total'))
            ->groupBy('nama_produk')
            ->orderByDesc('total')
            ->limit(3)
            ->get();
        $topNames = $top->pluck('nama_produk')->implode(', ');
        $topLeader = $top->first() ? $top->first()->nama_produk : 'Kopi Susu Jelang Senja';

        $fmtSales = number_format($salesToday, 0, ',', '.');
        $fmtAov = number_format($aov, 0, ',', '.');
        $marginKotor = number_format(round($salesToday * 0.65), 0, ',', '.');

        $shiftStatus = $activeShift ? "Shift aktif (Kasir: {$activeShift->user?->nama})" : "Belum ada shift kasir dibuka";
        $lowMaterialsText = $lowMaterials->isNotEmpty()
            ? $lowMaterials->map(fn($m) => "{$m->nama}: sisa {$m->stok} {$m->satuan} (Min: {$m->min_stok})")->implode(', ')
            : "Semua persediaan bahan baku aman";

        // ── GOOGLE GEMINI AI INTEGRATION ──
        $gemini = new \App\Services\GeminiService();
        $geminiReply = $gemini->ask($rawPrompt, [
            'salesToday' => "Rp {$fmtSales}",
            'countToday' => $countToday,
            'aov' => "Rp {$fmtAov}",
            'shiftStatus' => $shiftStatus,
            'kdsPending' => $kdsPending,
            'mejaInfo' => "{$mejaTerisi}/{$totalMeja} meja terisi",
            'lowMaterials' => $lowMaterialsText,
            'topLeader' => $topLeader,
            'vouchers' => Voucher::where('is_aktif', true)->pluck('kode')->implode(', ') ?: 'Tidak ada voucher aktif',
            'suppliers' => Supplier::pluck('nama')->implode(', ') ?: 'Belum ada',
        ]);

        if (!empty($geminiReply)) {
            $geminiActionLink = null;
            if (preg_match('/(kasir|checkout|transaksi|bayar)/i', $prompt)) {
                $geminiActionLink = ['label' => 'Buka POS Kasir', 'url' => '/kasir'];
            } elseif (preg_match('/(kds|dapur|kitchen|barista|antrean)/i', $prompt)) {
                $geminiActionLink = ['label' => 'Buka KDS Bar & Dapur', 'url' => '/kds'];
            } elseif (preg_match('/(stok|bahan|gudang)/i', $prompt)) {
                $geminiActionLink = ['label' => 'Kelola Bahan Baku', 'url' => '/stok/bahan-baku'];
            } elseif (preg_match('/(laporan|omset|keuangan)/i', $prompt)) {
                $geminiActionLink = ['label' => 'Lihat Laporan Harian', 'url' => '/laporan/harian'];
            } elseif (preg_match('/(promo|voucher|diskon)/i', $prompt)) {
                $geminiActionLink = ['label' => 'Kelola Promo', 'url' => '/promo'];
            } elseif (preg_match('/(absen|presensi)/i', $prompt)) {
                $geminiActionLink = ['label' => 'Presensi Staf', 'url' => '/absensi'];
            } elseif (preg_match('/(user|staf|karyawan)/i', $prompt)) {
                $geminiActionLink = ['label' => 'Kelola Pengguna', 'url' => '/users'];
            }

            return response()->json([
                'success' => true,
                'reply' => $geminiReply,
                'status_badge' => 'Google Gemini AI',
                'action_link' => $geminiActionLink,
                'metrics' => [
                    'omset' => "Rp {$fmtSales}",
                    'transaksi' => (string) $countToday,
                    'aov' => "Rp {$fmtAov}",
                    'kds_pending' => (string) $kdsPending,
                    'meja_terisi' => "{$mejaTerisi}/{$totalMeja}",
                    'stok_kritis' => (string) $lowMaterials->count(),
                ],
                'timestamp' => now()->format('H:i'),
            ]);
        }

        $statusBadge = 'Operasional Toko';
        $actionLink = null;
        $reply = '';

        // ── 1. GLOSARIUM & PENJELASAN ISTILAH SPESIFIK ──
        if (preg_match('/\b(void|batalkan nota|batal transaksi)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Bisnis';
            $reply = "Definisi & Prosedur Void:\n" .
                "• Void adalah pembatalan transaksi yang telah dicatat atau dibayar dalam sistem sebelum sesi kasir ditutup.\n" .
                "• Kapan Digunakan: Saat terjadi salah input varian/menu, pelanggan membatalkan pesanan, atau terjadi duplikasi pembayaran.\n" .
                "• Cara Melakukan Void di Sistem:\n" .
                "  1. Masuk ke POS Kasir (/kasir) lalu klik 'Riwayat Transaksi'.\n" .
                "  2. Cari nomor pesanan yang bersangkutan.\n" .
                "  3. Klik tombol 'Batalkan/Void' dan masukkan alasan pembatalan.\n" .
                "• Pengawasan: Setiap tindakan void otomatis tercatat pada log audit sistem demi mencegah kebocoran kas.";
            $actionLink = ['label' => 'Buka Riwayat Kasir', 'url' => '/kasir/riwayat'];
        }
        elseif (preg_match('/\b(hpp|cogs|harga pokok penjualan)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Finansial';
            $reply = "Definisi & Perhitungan HPP (Harga Pokok Penjualan):\n" .
                "• HPP adalah total biaya bahan mentah langsung untuk menyajikan satu porsi menu F&B.\n" .
                "• Rumus: Total Biaya Resep Bahan Baku per Cup/Porsi.\n" .
                "• Contoh: Es Kopi Susu terdiri dari 18g biji kopi (Rp 4.500) + 120ml fresh milk (Rp 2.400) + 25ml aren (Rp 1.000) + cup & sedotan (Rp 1.100) = HPP Rp 9.000.\n" .
                "• Di Jelang Hari POS, HPP dihitung otomatis melalui fitur Resep BOM (/resep) setiap kali transaksi diselesaikan.";
            $actionLink = ['label' => 'Kelola Resep BOM', 'url' => '/resep'];
        }
        elseif (preg_match('/\b(aov|average order value)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Finansial';
            $reply = "Definisi & Analisis AOV (Average Order Value):\n" .
                "• AOV adalah rata-rata nominal belanja yang dikeluarkan pelanggan per satu struk transaksi.\n" .
                "• Rumus: Total Omzet / Jumlah Struk.\n" .
                "• Data Toko Hari Ini: AOV saat ini sebesar Rp {$fmtAov} dari {$countToday} transaksi tercatat.\n" .
                "• Strategi Naikkan AOV: Terapkan upselling kasir (menawarkan add-on extra shot espresso atau upgrade susu oat) dan bundling pastry pendamping kopi.";
            $actionLink = ['label' => 'Lihat Laporan Harian', 'url' => '/laporan/harian'];
        }
        elseif (preg_match('/\b(bom|bill of materials|formula resep)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Inventori';
            $reply = "Definisi BOM (Bill of Materials):\n" .
                "• BOM adalah rincian takaran bahan baku standar yang menyusun suatu produk jadi.\n" .
                "• Fungsi Otomasi: Saat kasir menjual 1 cup menu, sistem otomatis memotong stok bahan di gudang sesuai gramasi dan mililiter di BOM tanpa perlu input manual.\n" .
                "• Lokasi Menu: Masuk ke menu Resep Produk (/resep) untuk menambah atau memperbarui takaran bahan per porsi.";
            $actionLink = ['label' => 'Buka Resep Produk', 'url' => '/resep'];
        }
        elseif (preg_match('/\b(stock opname|opname|audit fisik)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Inventori';
            $reply = "Definisi & Prosedur Stock Opname:\n" .
                "• Stock Opname adalah audit fisik berkala dengan menghitung langsung persediaan bahan di bar dan gudang untuk dicocokkan dengan saldo sistem.\n" .
                "• Manfaat: Mengidentifikasi selisih stok, bahan tumpah (waste/spoilage), atau barang kadaluwarsa.\n" .
                "• Rekomendasi: Lakukan opname mingguan atau setiap pergantian shift kerja barista.";
            $actionLink = ['label' => 'Cek Stok Gudang', 'url' => '/stok/bahan-baku'];
        }
        elseif (preg_match('/\b(petty cash|kas kecil|kas keluar)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Kasir';
            $reply = "Definisi Petty Cash (Kas Keluar):\n" .
                "• Petty Cash adalah dana kas kecil di laci kasir untuk kebutuhan belanja mendesak dan operasional harian toko (misal: beli es kristal darurat, air galon, gas, atau token listrik).\n" .
                "• Pencatatan: Gunakan tombol 'Kas Keluar' di Dashboard atau Kasir. Masukkan nominal dan keterangan belanja agar saldo kas tutup shift tetap akurat dan seimbang.";
            $actionLink = ['label' => 'Input Kas Keluar', 'url' => '/dashboard'];
        }
        elseif (preg_match('/\b(laba kotor|gross profit|gross margin)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Finansial';
            $reply = "Definisi Laba Kotor (Gross Profit):\n" .
                "• Laba Kotor adalah hasil penjualan kotor (omzet) dikurangi langsung dengan biaya bahan baku (HPP).\n" .
                "• Rumus: Omzet - HPP Bahan Baku.\n" .
                "• Estimasi Toko Hari Ini: Rp {$marginKotor} berdasarkan omset Rp {$fmtSales} (estimasi gross margin kafe 65%).";
            $actionLink = ['label' => 'Buka Laporan Finansial', 'url' => '/laporan/harian'];
        }
        elseif (preg_match('/\b(laba bersih|net profit|net margin|bep)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Finansial';
            $reply = "Definisi Laba Bersih (Net Profit):\n" .
                "• Laba Bersih adalah keuntungan murni setelah Laba Kotor dikurangi seluruh beban operasional (OPEX) seperti beban gaji staf, sewa gedung, listrik, internet, dan kas kecil.\n" .
                "• Rumus: Laba Bersih = Laba Kotor - Total Biaya Operasional.";
            $actionLink = ['label' => 'Buka Laporan Keuangan', 'url' => '/laporan/harian'];
        }
        elseif (preg_match('/\b(sla|waktu saji|waktu tunggu|lead time)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Operasional';
            $reply = "Standar SLA (Service Level Agreement) Penyajian:\n" .
                "• SLA adalah target batas maksimal durasi penyajian dari nota dibayar hingga pesanan sampai di tangan tamu.\n" .
                "• Standar Kafe Jelang Hari:\n" .
                "  - Minuman Bar / Barista: 5 - 7 menit per tiket\n" .
                "  - Makanan Kitchen / Dapur: 12 - 15 menit per tiket\n" .
                "• Monitor KDS akan menampilkan indikator warna kuning/merah jika durasi melebihi standar ini.";
            $actionLink = ['label' => 'Buka KDS Bar & Dapur', 'url' => '/kds'];
        }
        elseif (preg_match('/\b(crema|dial in|ekstraksi|grind size)\b/i', $prompt)) {
            $statusBadge = 'Teknis Barista';
            $reply = "Istilah Kalibrasi Barista:\n" .
                "• Dial-in: Kalibrasi rasio ekstraksi espresso harian (dose gramasi biji kopi, yield berat cairan, dan waktu seduh 25-30 detik) agar rasa kopi seimbang.\n" .
                "• Crema: Lapisan emulsi busa keemasan di atas espresso yang menunjukkan kesegaran biji kopi dan ekstraksi yang pas.\n" .
                "• Lakukan kalibrasi dial-in setiap pagi sebelum toko buka atau saat berganti batch biji kopi.";
            $actionLink = ['label' => 'Buka POS Kasir', 'url' => '/kasir'];
        }
        elseif (preg_match('/\b(fifo|first in first out)\b/i', $prompt)) {
            $statusBadge = 'Glosarium Inventori';
            $reply = "Prinsip FIFO (First In First Out):\n" .
                "• Metode penataan bahan baku di mana barang yang pertama kali masuk gudang harus digunakan terlebih dahulu.\n" .
                "• Sangat krusial untuk bahan baku dengan masa simpan singkat seperti Fresh Milk, Biji Kopi Roast, Sirup Buah, dan Pastry.";
            $actionLink = ['label' => 'Kelola Stok Bahan', 'url' => '/stok/bahan-baku'];
        }

        // ── 2. TUTORIAL & PANDUAN CARA PENGGUNAAN FITUR (HOW-TO) ──
        elseif (preg_match('/(tambah user|kelola user|role|tambah kasir|pin kasir|ganti password|akun staf|pengguna baru)/i', $prompt)) {
            $statusBadge = 'Panduan Pengguna';
            $reply = "Panduan Pengelolaan Akun & Hak Akses Staf:\n" .
                "1. Masuk ke menu Kelola Pengguna (/users) menggunakan akun Owner atau Manajer.\n" .
                "2. Klik 'Tambah Pengguna Baru'.\n" .
                "3. Isi identitas staf dan tentukan role yang sesuai (Kasir, Barista, Kitchen, Manajer, atau Owner).\n" .
                "4. Atur PIN 6 Digit: PIN ini digunakan staf untuk otentikasi cepat saat shift kasir dan clock-in presensi.\n" .
                "5. Simpan data untuk mengaktifkan akun staf.";
            $actionLink = ['label' => 'Kelola Akun Pengguna', 'url' => '/users'];
        }
        elseif (preg_match('/(buka shift|tutup shift|cara shift|kelola shift|ganti shift)/i', $prompt)) {
            $statusBadge = 'Panduan Shift';
            $reply = "Panduan Manajemen Shift Kasir:\n" .
                "1. Buka Shift: Saat staf mulai bertugas, buka menu POS Kasir dan masukkan nominal uang kas awal di laci (modal kembalian).\n" .
                "2. Transaksi Berjalan: Seluruh arus transaksi kasir (tunai, non-tunai, dan kas keluar) tercatat dalam sesi shift tersebut.\n" .
                "3. Tutup Shift: Di akhir jam kerja, klik 'Tutup Shift', hitung uang tunai fisik di laci kasir, lalu masukkan ke sistem untuk verifikasi apakah kas seimbang atau terdapat selisih.";
            $actionLink = ['label' => 'Buka POS Kasir', 'url' => '/kasir'];
        }
        elseif (preg_match('/(kas keluar|catat pengeluaran|input pengeluaran|biaya operasional)/i', $prompt)) {
            $statusBadge = 'Panduan Pengeluaran';
            $reply = "Panduan Catat Kas Keluar (Pengeluaran Operasional):\n" .
                "1. Akses Tombol: Pada Dashboard atau POS Kasir, klik tombol 'Kas Keluar'.\n" .
                "2. Input Rincian: Masukkan nama pengeluaran (misal: Beli Es Batu Kristal, Beli Galon, Token Listrik) beserta nominal rupiahnya.\n" .
                "3. Simpan: Pengeluaran akan otomatis memotong saldo kas tunai pada sesi shift kasir hari ini.";
            $actionLink = ['label' => 'Input Kas Keluar', 'url' => '/dashboard'];
        }
        elseif (preg_match('/(struk|cetak ulang|print ulang|reprint|bukti bayar|nota)/i', $prompt)) {
            $statusBadge = 'Panduan Struk';
            $reply = "Panduan Cetak Ulang Struk Kasir:\n" .
                "1. Buka POS Kasir (/kasir), lalu klik tombol 'Riwayat Transaksi' di bar navigasi atas.\n" .
                "2. Temukan pesanan berdasarkan nomor struk atau jam transaksi.\n" .
                "3. Klik ikon Struk/Printer untuk menampilkan pratinjau struk.\n" .
                "4. Klik tombol 'Cetak Thermal' atau salin tautan Struk Digital untuk dikirimkan ke pelanggan.";
            $actionLink = ['label' => 'Buka Riwayat Kasir', 'url' => '/kasir/riwayat'];
        }
        elseif (preg_match('/(kds|dapur|kitchen|barista|batal.*kds|batalkan.*kitchen|antrean order)/i', $prompt)) {
            $statusBadge = 'Panduan KDS';
            $reply = "Panduan Kitchen & Bar Display System (KDS):\n" .
                "1. Tampilan Realtime: Setiap pesanan yang dibayar di kasir akan langsung muncul di monitor bar dan dapur.\n" .
                "2. Ubah Status: Klik kartu pesanan untuk memindahkan status dari 'Menunggu' ke 'Diproses', lalu klik 'Selesai' saat pesanan selesai diracik.\n" .
                "3. Pembatalan Pesanan: Apabila pesanan dibatalkan sebelum diproduksi, klik tombol opsi pada kartu pesanan di KDS lalu pilih batalkan pesanan untuk mengeluarkan tiket dari antrean produksi.";
            $actionLink = ['label' => 'Buka KDS Bar & Dapur', 'url' => '/kds'];
        }
        elseif (preg_match('/(absen|absensi|clock in|clock out|presensi|izin|cuti|sakit)/i', $prompt)) {
            $statusBadge = 'Panduan Absensi';
            $reply = "Panduan Presensi & Absensi Karyawan:\n" .
                "1. Presensi Mandiri: Buka menu Presensi (/absensi).\n" .
                "2. Masukkan PIN: Input PIN 6 digit staf yang sudah terdaftar.\n" .
                "3. Clock In & Out: Klik 'Clock In' saat mulai kerja dan 'Clock Out' saat pulang.\n" .
                "4. Pengajuan Izin/Sakit: Klik menu Pengajuan Izin untuk melampirkan keterangan izin atau surat sakit agar diverifikasi oleh Manajer/Owner.";
            $actionLink = ['label' => 'Buka Menu Presensi', 'url' => '/absensi'];
        }
        elseif (preg_match('/(cara|panduan|langkah|bagaimana|tutorial).*(kasir|checkout|transaksi|bayar|order|pesan)/i', $prompt) || preg_match('/(cara checkout|cara transaksi|cara pakai kasir)/i', $prompt)) {
            $statusBadge = 'Panduan Kasir';
            $reply = "Panduan Transaksi Kasir POS:\n" .
                "1. Pilih Kategori & Menu: Klik item produk pada katalog kasir untuk memasukkannya ke keranjang belanja.\n" .
                "2. Sesuaikan Varian: Atur level es, gula, atau catatan pesanan tamu jika diminta.\n" .
                "3. Tentukan Meja/Tamu: Pilih nomor meja (dine-in) atau isi nama pelanggan / nomor handphone member.\n" .
                "4. Terapkan Voucher: Input kode kupon diskon jika tamu memiliki voucher promo.\n" .
                "5. Pembayaran: Klik 'Bayar Sekarang', pilih metode (Tunai, QRIS, Transfer, atau Debit/Kredit).\n" .
                "6. Cetak Struk: Cetak struk fisik printer thermal atau tampilkan struk digital.";
            $actionLink = ['label' => 'Buka POS Kasir', 'url' => '/kasir'];
        }
        elseif (preg_match('/(resep|buat resep|atur bom|formula bahan)/i', $prompt)) {
            $statusBadge = 'Panduan Resep';
            $reply = "Panduan Pengaturan Resep Produk (BOM):\n" .
                "1. Buka menu Resep (/resep).\n" .
                "2. Pilih produk minuman atau makanan yang ingin diatur formulanya.\n" .
                "3. Tentukan bahan baku dan takaran per porsi (contoh: 18g Biji Kopi, 150ml Susu UHT, 20ml Sirup).\n" .
                "4. Simpan resep. Setiap transaksi di kasir akan langsung memotong persediaan bahan baku secara otomatis.";
            $actionLink = ['label' => 'Kelola Resep Produk', 'url' => '/resep'];
        }
        elseif (preg_match('/(buat promo|bikin voucher|tambah diskon|atur promo)/i', $prompt)) {
            $statusBadge = 'Panduan Promo';
            $reply = "Panduan Pembuatan Voucher & Promo:\n" .
                "1. Masuk ke menu Promo & Voucher (/promo).\n" .
                "2. Klik tombol 'Tambah Voucher Baru'.\n" .
                "3. Buat kode voucher (misal: JELANGHEMAT), tentukan tipe potongan (persentase % atau nominal rupiah), dan isi kuota serta minimal belanja.\n" .
                "4. Aktifkan voucher agar dapat langsung diinput oleh kasir saat checkout pesanan.";
            $actionLink = ['label' => 'Kelola Promo & Voucher', 'url' => '/promo'];
        }
        elseif (preg_match('/(meja|denah meja|atur meja|qr meja)/i', $prompt)) {
            $statusBadge = 'Panduan Meja';
            $reply = "Panduan Pengelolaan Meja & Dine-In:\n" .
                "1. Buka menu Meja (/meja) untuk memantau denah meja (Warna Hijau: Kosong, Merah: Terisi).\n" .
                "2. Saat kasir mencatat pesanan dine-in, pilih meja terkait agar status meja otomatis berubah menjadi terisi.\n" .
                "3. Tamu juga dapat memesan mandiri dengan scan QR Code meja yang otomatis meneruskan pesanan ke kasir dan KDS.";
            $actionLink = ['label' => 'Kelola Meja', 'url' => '/kasir'];
        }

        // ── 3. QUERY DATA SPESIFIK DATABASE (PRODUK, BAHAN, SUPPLIER, VOUCHER, SHIFT) ──
        elseif (preg_match('/(supplier|vendor|pemasok)/i', $prompt)) {
            $statusBadge = 'Data Supplier';
            $suppliers = Supplier::all();
            if ($suppliers->isNotEmpty()) {
                $supList = $suppliers->map(fn($s) => "• {$s->nama}" . ($s->telepon ? " (Telp: {$s->telepon})" : "") . ($s->alamat ? " - {$s->alamat}" : ""))->implode("\n");
                $reply = "Daftar Mitra Supplier Terdaftar:\n" .
                    $supList . "\n\n" .
                    "Pencatatan faktur barang masuk dan pengadaan bahan dapat dilakukan melalui menu Pembelian Gudang (/stok/pembelian).";
            } else {
                $reply = "Belum ada mitra supplier yang didaftarkan. Anda dapat menambahkan data vendor kopi, susu, sirup, dan kemasan di menu Supplier.";
            }
            $actionLink = ['label' => 'Kelola Supplier', 'url' => '/stok/supplier'];
        }
        elseif (preg_match('/(voucher|kode promo|kupon diskon|diskon aktif)/i', $prompt)) {
            $statusBadge = 'Voucher Aktif';
            $vouchers = Voucher::where('is_aktif', true)->get();
            if ($vouchers->isNotEmpty()) {
                $vList = $vouchers->map(function($v) {
                    $diskon = $v->tipe === 'persen' ? "{$v->nilai}%" : "Rp " . number_format($v->nilai, 0, ',', '.');
                    $min = $v->min_belanja > 0 ? " (Min. Belanja: Rp " . number_format($v->min_belanja, 0, ',', '.') . ")" : "";
                    return "• Kode: {$v->kode} - Diskon {$diskon}{$min}";
                })->implode("\n");
                $reply = "Daftar Kode Voucher & Promo Aktif:\n" .
                    $vList . "\n\n" .
                    "Kode ini dapat langsung diinput oleh kasir saat checkout di keranjang belanja.";
            } else {
                $reply = "Saat ini belum ada voucher aktif di sistem. Anda dapat membuat voucher baru di menu Promo.";
            }
            $actionLink = ['label' => 'Kelola Promo & Voucher', 'url' => '/promo'];
        }
        elseif (preg_match('/(siapa kasir|shift siapa|kasir bertugas|shift aktif)/i', $prompt)) {
            $statusBadge = 'Shift Kasir';
            if ($activeShift) {
                $startTime = $activeShift->created_at ? $activeShift->created_at->format('H:i') : '-';
                $kasAwal = number_format($activeShift->kas_awal ?? 0, 0, ',', '.');
                $reply = "Informasi Shift Kasir Aktif:\n" .
                    "• Kasir Bertugas: {$activeShift->user?->nama} ({$activeShift->user?->role})\n" .
                    "• Waktu Buka Shift: {$startTime} WIB\n" .
                    "• Modal Kas Awal: Rp {$kasAwal}\n" .
                    "• Transaksi Sesi Ini: {$countToday} nota";
            } else {
                $reply = "Saat ini belum ada sesi shift kasir yang dibuka. Kasir bertugas disarankan membuka shift dengan menginput modal kas awal sebelum memulai transaksi.";
            }
            $actionLink = ['label' => 'Buka POS Kasir', 'url' => '/kasir'];
        }
        elseif (preg_match('/(stok|bahan|biji kopi|susu|sirup|gula|cup|gudang)/i', $prompt)) {
            $statusBadge = 'Persediaan Bahan';
            // Cek pencarian nama spesifik jika ada
            $keywords = ['susu', 'kopi', 'sirup', 'syrup', 'gula', 'cup', 'aren', 'matcha', 'teh', 'powder'];
            $matchedKeyword = null;
            foreach ($keywords as $kw) {
                if (str_contains($prompt, $kw)) {
                    $matchedKeyword = $kw;
                    break;
                }
            }

            $materialsQuery = BahanBaku::query();
            if ($matchedKeyword) {
                $materialsQuery->where('nama', 'like', "%{$matchedKeyword}%");
            }
            $materials = $materialsQuery->orderBy('stok', 'asc')->limit(6)->get();

            if ($materials->isNotEmpty()) {
                $mList = $materials->map(function($m) {
                    $status = $m->stok <= $m->min_stok ? "KRITIS (Min: {$m->min_stok})" : "Aman";
                    return "• {$m->nama}: {$m->stok} {$m->satuan} [Status: {$status}]";
                })->implode("\n");
                $reply = "Informasi Stok Bahan Baku Gudang:\n" .
                    $mList . "\n\n" .
                    "Pastikan bahan yang berada pada status kritis segera dilakukan purchase order ke supplier.";
            } else {
                $reply = "Semua persediaan bahan baku utama berada di atas batas minimum stok operasional.";
            }
            $actionLink = ['label' => 'Kelola Bahan Baku', 'url' => '/stok/bahan-baku'];
        }
        elseif (preg_match('/(harga|menu|produk|kopi|latte|americano|mojito|croissant|snack|minuman|makanan)/i', $prompt) && !preg_match('/(bagaimana|cara|panduan)/i', $prompt)) {
            $statusBadge = 'Katalog Menu';
            // Cari kata kunci produk
            $cleaned = preg_replace('/[^a-zA-Z0-9\s]/', '', $prompt);
            $words = array_filter(explode(' ', $cleaned), fn($w) => strlen($w) >= 3 && !in_array($w, ['berapa', 'harga', 'menu', 'produk', 'apakah', 'ada', 'yang', 'untuk', 'dari', 'bisa', 'kita']));
            $productResults = collect();
            if (!empty($words)) {
                $productResults = Produk::where('is_tersedia', true)
                    ->where(function($q) use ($words) {
                        foreach ($words as $w) {
                            $q->orWhere('nama', 'like', "%{$w}%");
                        }
                    })
                    ->limit(5)
                    ->get();
            }

            if ($productResults->isNotEmpty()) {
                $pList = $productResults->map(function($p) {
                    $hrg = number_format($p->harga, 0, ',', '.');
                    return "• {$p->nama}: Rp {$hrg}";
                })->implode("\n");
                $reply = "Daftar Menu Produk Terkait:\n" .
                    $pList . "\n\n" .
                    "Katalog lengkap dan kustomisasi menu dapat diakses di menu Produk (/produk).";
            } else {
                $topList = $topNames ?: 'Kopi Susu Jelang Senja, Vanilla Latte, Americano';
                $reply = "Katalog Menu Produk Jelang Hari:\n" .
                    "• Produk Terlaris: {$topLeader}\n" .
                    "• Menu Favorit Tamu: {$topList}\n\n" .
                    "Ketik nama menu spesifik (misal: 'harga latte' atau 'harga americano') untuk melihat rincian harga.";
            }
            $actionLink = ['label' => 'Kelola Produk', 'url' => '/produk'];
        }

        // ── 4. RESOLUSI KOMPLAIN & HOSPITALITY ──
        elseif (preg_match('/(komplain|marah|kecewa|salah racik|lama saji|pelanggan komplain|tamu komplain|masalah pelayanan)/i', $prompt)) {
            $statusBadge = 'Resolusi Tamu';
            $reply = "Prosedur Standar Penanganan Komplain Tamu (Metode L.A.S.T):\n" .
                "1. Listen (Dengarkan): Dengarkan keluhan tamu secara tuntas tanpa menyela atau berdebat.\n" .
                "2. Apologize (Permohonan Maaf): Sampaikan permohonan maaf yang tulus atas ketidaknyamanan rasa atau keterlambatan saji.\n" .
                "3. Solve (Solusi Seketika): Ganti pesanan baru dengan prioritas pertama di KDS Bar/Kitchen tanpa membebankan biaya tambahan.\n" .
                "4. Thank (Apresiasi): Ucapkan terima kasih atas masukan demi menjaga konsistensi standar kualitas kafe.\n\n" .
                "Tamu yang komplainnya diselesaikan secara cepat memiliki peluang kembali hingga 70%.";
            $actionLink = ['label' => 'Buka KDS Barista', 'url' => '/kds'];
        }

        // ── 5. STRATEGI PENJUALAN & IDE PROMO ──
        elseif (preg_match('/(promo|ide promo|diskon|menaikkan penjualan|laris|ide|marketing|ramai|omset naik|strategi)/i', $prompt)) {
            $statusBadge = 'Strategi Penjualan';
            $reply = "Strategi Peningkatan Omset & AOV Kafe:\n" .
                "1. Menu Bundling: Buat paket kombinasi {$topLeader} + Pastry seharga Rp 38.000 pada jam 15.00 - 18.00.\n" .
                "2. Upselling Kasir: Tawarkan opsi Add Extra Shot (+Rp 5.000) atau Upgrade Susu Oat (+Rp 8.000) pada setiap pesanan espresso base.\n" .
                "3. Happy Hour: Berikan diskon 15% pada jam sepi 13.00 - 15.00 guna mengisi okupansi meja.\n" .
                "4. Member Loyalty: Ajak pelanggan mendaftarkan nomor telepon untuk mengumpulkan poin belanja.";
            $actionLink = ['label' => 'Kelola Promo & Voucher', 'url' => '/promo'];
        }

        // ── 6. CURHAT / CERITA / DISKUSI OPERASIONAL KAFE ──
        elseif (preg_match('/(cerita|curhat|capek|lelah|pusing|stres|sepi|ramai|hari ini|pengalaman|gimana menurutmu|sharing)/i', $prompt)) {
            $statusBadge = 'Diskusi Operasional';
            $moodReply = "";
            if (preg_match('/(capek|lelah|pusing|stres|berat)/i', $prompt)) {
                $moodReply = "Menjalankan coffee shop menuntut stamina fisik dan konsistensi rasa yang prima. Pastikan rotasi istirahat staf bar dan dapur berjalan teratur agar fokus pelayanan tetap terjaga.";
            } elseif (preg_match('/(sepi|kurang ramai|target belum)/i', $prompt)) {
                $moodReply = "Fluktuasi jam sepi adalah ritme wajar bisnis F&B. Maksimalkan jam low-hour untuk persiapan batching sirup/susu, kebersihan area bar, dan aktivasi promo sore.";
            } else {
                $moodReply = "Operasional toko hari ini berjalan stabil dengan interaksi pelayanan yang terjaga.";
            }

            $reply = "Evaluasi Operasional Toko:\n" .
                $moodReply . "\n\n" .
                "Ringkasan Angka Hari Ini:\n" .
                "• Akumulasi Omset: Rp {$fmtSales} ({$countToday} nota)\n" .
                "• Produk Terlaris: {$topLeader}\n" .
                "• Rata-rata Pembelian: Rp {$fmtAov} per transaksi";
            $actionLink = ['label' => 'Lihat Laporan Penjualan', 'url' => '/laporan/harian'];
        }

        // ── 7. SAPAAN & RINGKASAN TOKO (P, HALO, HAI, PAGI, TES) ──
        elseif (preg_match('/^(p|halo|hai|tes|test|pagi|siang|sore|malam|assalam|assalamu|hei|oi|hi)$/i', $prompt) || preg_match('/(siapa kamu|jelang hari copilot|kamu siapa|bisa apa)/i', $prompt)) {
            $shiftStatus = $activeShift ? "Shift aktif (Kasir: {$activeShift->user?->nama})" : "Belum ada shift dibuka";
            $matStatus = $lowMaterials->count() > 0 ? "{$lowMaterials->count()} bahan mendekati batas minimum" : "Persediaan bahan baku aman";

            $reply = "Jelang Hari Copilot siap membantu. Ringkasan operasional terkini:\n" .
                "• Omset Hari Ini: Rp {$fmtSales} ({$countToday} transaksi, AOV Rp {$fmtAov})\n" .
                "• Status Shift: {$shiftStatus}\n" .
                "• Antrean KDS: {$kdsPending} tiket pesanan aktif\n" .
                "• Meja Terisi: {$mejaTerisi} dari {$totalMeja} meja aktif\n" .
                "• Status Bahan Baku: {$matStatus}\n" .
                "• Produk Terlaris: {$topLeader}\n\n" .
                "Silakan ajukan pertanyaan seputar tutorial sistem kasir, KDS, stok bahan, resep BOM, laporan keuangan, atau glosarium istilah bisnis kafe.";
            $actionLink = ['label' => 'Buka POS Kasir', 'url' => '/kasir'];
        }

        // ── 8. LAPORAN KEUANGAN & AUDIT UMUM ──
        elseif (preg_match('/(omset|omzet|penjualan|keuangan|uang|pendapatan|audit|kondisi toko|performa toko)/i', $prompt)) {
            $statusBadge = 'Analisis Finansial';
            $reply = "Analisis Finansial & Operasional Toko:\n" .
                "• Omset Hari Ini: Rp {$fmtSales} ({$countToday} transaksi)\n" .
                "• Rata-rata Belanja (AOV): Rp {$fmtAov} per nota\n" .
                "• Estimasi Margin Kotor: Rp {$marginKotor} (gross margin ~65%)\n" .
                ($growthText ? "• Tren Penjualan: {$growthText}\n" : "") .
                "• Okupansi Meja: {$mejaTerisi} dari {$totalMeja} meja terisi\n" .
                "• Antrean KDS: {$kdsPending} pesanan aktif\n\n" .
                "Rekomendasi: Dorong upselling menu pendamping untuk mempertahankan AOV di atas Rp 40.000+.";
            $actionLink = ['label' => 'Lihat Laporan Harian', 'url' => '/laporan/harian'];
        }

        // ── 9. SMART CONTEXTUAL FALLBACK (MENJAWAB RELEVAN, BUKAN TEMPLATE MATI) ──
        else {
            $statusBadge = 'Bantuan Sistem';
            $reply = "Informasi Jelang Hari Copilot:\n" .
                "Topik yang Anda tanyakan terkait operasional kafe Jelang Hari dapat ditangani melalui fitur berikut:\n" .
                "• Transaksi & Kasir: Gunakan menu POS Kasir (/kasir) untuk penjualan, cetak struk, dan manajemen shift.\n" .
                "• Produksi & Pesanan: Gunakan Kitchen Display System (/kds) untuk memantau status racikan minuman bar dan masakan dapur.\n" .
                "• Inventori & Stok: Gunakan menu Bahan Baku (/stok/bahan-baku) dan Resep BOM (/resep) untuk kontrol persediaan.\n" .
                "• Laporan & Analitik: Gunakan menu Laporan (/laporan/harian) untuk melihat pembukuan dan omset.\n\n" .
                "Silakan ajukan pertanyaan lebih spesifik (misal: 'apa itu void?', 'cara input kas keluar', 'harga latte', atau 'cek stok susu').";
            $actionLink = ['label' => 'Buka POS Kasir', 'url' => '/kasir'];
        }

        return response()->json([
            'success' => true,
            'reply' => $reply,
            'status_badge' => $statusBadge,
            'action_link' => $actionLink,
            'metrics' => [
                'omset' => "Rp {$fmtSales}",
                'transaksi' => (string) $countToday,
                'aov' => "Rp {$fmtAov}",
                'kds_pending' => (string) $kdsPending,
                'meja_terisi' => "{$mejaTerisi}/{$totalMeja}",
                'stok_kritis' => (string) $lowMaterials->count(),
            ],
            'timestamp' => now()->format('H:i'),
        ]);
    }
}
