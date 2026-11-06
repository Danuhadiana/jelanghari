<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Customer;
use App\Models\Pesanan;
use App\Models\Voucher;
use App\Models\Meja;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class CustomerDashboardController extends Controller
{
    /**
     * Tampilkan laman dashboard khusus pengguna / pelanggan / member.
     */
    public function index()
    {
        $user = Auth::user();

        // Cari atau buat entitas Customer sinkron dengan data User
        $customer = Customer::firstOrCreate(
            ['email' => $user->email],
            [
                'nama' => $user->name,
                'telepon' => $user->telepon,
                'poin' => 25, // Bonus pendaftaran
                'total_transaksi' => 0,
                'kunjungan_count' => 0,
            ]
        );

        // Jika nomor telepon baru diperbarui di user
        if ($user->telepon && !$customer->telepon) {
            $customer->update(['telepon' => $user->telepon]);
        }

        $poin = (int) $customer->poin;

        // Tentukan level / tier keanggotaan
        $tier = 'Bronze Member';
        $tierColor = 'from-amber-700 to-amber-900';
        $tierDiscount = 'Akses WiFi & Menu Spesial';
        $nextTierTarget = 100;
        $nextTierName = 'Silver Member';

        if ($poin >= 700) {
            $tier = 'Platinum VIP';
            $tierColor = 'from-slate-800 to-zinc-950 border-amber-500/50';
            $tierDiscount = 'Diskon 15% + Akses VIP Workspace';
            $nextTierTarget = $poin; // Max
            $nextTierName = 'Level Tertinggi';
        } elseif ($poin >= 300) {
            $tier = 'Gold Member';
            $tierColor = 'from-amber-500 to-yellow-600';
            $tierDiscount = 'Diskon 10% + Free Upsize Minuman';
            $nextTierTarget = 700;
            $nextTierName = 'Platinum VIP';
        } elseif ($poin >= 100) {
            $tier = 'Silver Member';
            $tierColor = 'from-zinc-400 to-zinc-600';
            $tierDiscount = 'Diskon 5% Semua Pesanan Dine-in';
            $nextTierTarget = 300;
            $nextTierName = 'Gold Member';
        }

        $tierProgress = $nextTierTarget > 0 ? min(100, round(($poin / $nextTierTarget) * 100)) : 100;

        // ID Kartu Member Virtual
        $memberId = 'JH-' . str_pad((string) $user->id, 5, '0', STR_PAD_LEFT);

        // Pesanan Aktif (Menunggu Konfirmasi, Sedang Diracik, Siap Diambil)
        $activeOrders = Pesanan::where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->telepon) {
                    $q->orWhere('telepon_pelanggan', $user->telepon);
                }
            })
            ->whereIn('status_pesanan', ['menunggu', 'diproses', 'siap'])
            ->with(['meja', 'details'])
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nomor_pesanan' => $p->nomor_pesanan,
                'total' => (float) $p->total,
                'status_pesanan' => $p->status_pesanan,
                'status_pembayaran' => $p->status_pembayaran,
                'metode_pembayaran' => $p->metode_pembayaran,
                'tipe_pesanan' => $p->tipe_pesanan,
                'meja' => $p->meja ? ['nomor' => $p->meja->nomor] : null,
                'items_count' => $p->details->sum('jumlah'),
                'created_at' => $p->created_at->format('d M Y, H:i'),
            ]);

        // Riwayat Pesanan Selesai / Terakhir
        $recentOrders = Pesanan::where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->telepon) {
                    $q->orWhere('telepon_pelanggan', $user->telepon);
                }
            })
            ->with(['meja', 'details'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nomor_pesanan' => $p->nomor_pesanan,
                'total' => (float) $p->total,
                'status_pesanan' => $p->status_pesanan,
                'status_pembayaran' => $p->status_pembayaran,
                'metode_pembayaran' => $p->metode_pembayaran,
                'tipe_pesanan' => $p->tipe_pesanan,
                'meja' => $p->meja ? ['nomor' => $p->meja->nomor] : null,
                'items' => $p->details->map(fn($d) => [
                    'nama_produk' => $d->nama_produk,
                    'nama_varian' => $d->nama_varian,
                    'jumlah' => $d->jumlah,
                    'subtotal' => (float) $d->subtotal,
                ]),
                'created_at' => $p->created_at->format('d M Y, H:i'),
            ]);

        // Voucher Aktif
        $vouchers = Voucher::where('is_aktif', true)
            ->latest()
            ->take(6)
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'kode' => $v->kode,
                'nama' => $v->nama,
                'tipe' => $v->tipe,
                'nilai' => (float) $v->nilai,
                'min_transaksi' => (float) $v->min_transaksi,
                'berlaku_sampai' => $v->berlaku_sampai ? $v->berlaku_sampai->format('d M Y') : null,
            ]);

        // Pengaturan Fasilitas Kafe (WiFi, Jam Operasional, Lokasi)
        $facilities = [
            'nama_cafe' => Pengaturan::get('nama_cafe', 'Jelang Hari Coffee & Workspace'),
            'alamat_cafe' => Pengaturan::get('alamat_cafe', 'Jl. AH Nasution No 293, Mangkubumi'),
            'telepon_cafe' => Pengaturan::get('telepon_cafe', '0821-1594-1156'),
            'wifi_ssid' => Pengaturan::get('wifi_ssid', 'JelangHari_Workspace'),
            'wifi_password' => Pengaturan::get('wifi_password', 'ngopidulu123'),
        ];

        // Daftar Meja untuk Reservasi
        $mejas = Meja::where('is_aktif', true)->orderBy('nomor')->get(['id', 'nomor', 'kapasitas', 'status']);

        // Riwayat Reservasi Pengguna
        $reservations = \App\Models\Reservasi::where('user_id', $user->id)
            ->with('meja')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'tanggal' => $r->tanggal->format('d M Y'),
                'raw_tanggal' => $r->tanggal->format('Y-m-d'),
                'jam' => $r->jam,
                'durasi_jam' => $r->durasi_jam,
                'jumlah_orang' => $r->jumlah_orang,
                'nomor_meja' => $r->meja?->nomor,
                'status' => $r->status,
                'dp_nominal' => (float) $r->dp_nominal,
                'catatan' => $r->catatan,
                'catatan_admin' => $r->catatan_admin,
                'created_at' => $r->created_at->format('d M Y, H:i'),
            ]);

        $reservationSettings = [
            'is_aktif' => (string) Pengaturan::get('reservasi_aktif', '1') === '1',
            'jam_buka' => (string) Pengaturan::get('reservasi_jam_buka', '09:00'),
            'jam_tutup' => (string) Pengaturan::get('reservasi_jam_tutup', '22:00'),
            'min_dp' => (float) Pengaturan::get('reservasi_min_dp', 0),
            'maks_durasi' => (int) Pengaturan::get('reservasi_maks_durasi', 2),
            'syarat' => (string) Pengaturan::get('reservasi_syarat', 'Harap hadir tepat waktu. Meja akan ditahan maksimal 20 menit setelah jam reservasi.'),
            'wa_admin' => (string) Pengaturan::get('reservasi_wa_admin', '0821-1594-1156'),
        ];

        return Inertia::render('User/CustomerDashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telepon' => $user->telepon,
                'role' => $user->role,
                'member_since' => $user->created_at->format('M Y'),
            ],
            'member' => [
                'id_card' => $memberId,
                'poin' => $poin,
                'tier' => $tier,
                'tier_color' => $tierColor,
                'tier_discount' => $tierDiscount,
                'next_tier_name' => $nextTierName,
                'next_tier_target' => $nextTierTarget,
                'tier_progress' => $tierProgress,
                'total_kunjungan' => (int) $customer->kunjungan_count,
                'total_transaksi' => (float) $customer->total_transaksi,
            ],
            'activeOrders' => $activeOrders,
            'recentOrders' => $recentOrders,
            'vouchers' => $vouchers,
            'facilities' => $facilities,
            'mejas' => $mejas,
            'reservations' => $reservations,
            'reservationSettings' => $reservationSettings,
        ]);
    }

    /**
     * Perbarui Profil Akun Pelanggan.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'telepon' => 'nullable|string|max:20',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->telepon = $request->telepon;
        $user->save();

        // Sinkronkan ke data Customer
        Customer::where('email', $user->email)
            ->update([
                'nama' => $request->name,
                'telepon' => $request->telepon,
            ]);

        return back()->with('success', 'Profil akun berhasil diperbarui!');
    }

    /**
     * Perbarui Kata Sandi Pelanggan.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Kata sandi berhasil diganti!');
    }

    /**
     * Kirim Reservasi Meja / Workspace.
     */
    public function reserveWorkspace(Request $request)
    {
        $isAktif = (string) Pengaturan::get('reservasi_aktif', '1');
        if ($isAktif !== '1') {
            return back()->with('error', 'Mohon maaf, sistem reservasi meja dan workspace saat ini sedang ditutup sementara oleh pihak manajemen kafe.');
        }

        $validated = $request->validate([
            'tanggal' => 'required|date|after_or_equal:today',
            'jam' => 'required|string',
            'durasi_jam' => 'nullable|integer|min:1|max:8',
            'jumlah_orang' => 'required|integer|min:1|max:30',
            'meja_id' => 'nullable|exists:mejas,id',
            'catatan' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        \App\Models\Reservasi::create([
            'user_id' => $user->id,
            'nama_pemesan' => $user->name,
            'telepon' => $user->telepon ?: '081234567890',
            'tanggal' => $validated['tanggal'],
            'jam' => $validated['jam'],
            'durasi_jam' => $validated['durasi_jam'] ?? (int) Pengaturan::get('reservasi_maks_durasi', 2),
            'jumlah_orang' => $validated['jumlah_orang'],
            'meja_id' => $validated['meja_id'] ?? null,
            'status' => 'menunggu',
            'dp_nominal' => (float) Pengaturan::get('reservasi_min_dp', 0),
            'catatan' => $validated['catatan'] ?? null,
        ]);

        return back()->with('success', 'Permintaan reservasi meja & workspace berhasil diajukan! Pihak admin/kasir Jelang Hari akan segera mengonfirmasi jadwal Anda.');
    }
}
