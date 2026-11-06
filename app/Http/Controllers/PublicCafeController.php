<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Produk;
use App\Models\Meja;
use App\Models\Pesanan;
use App\Models\DetailPesanan;
use App\Models\DetailPesananModifier;
use App\Models\Pengaturan;
use App\Models\Voucher;
use App\Models\Reservasi;
use App\Services\StockService;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PublicCafeController extends Controller
{
    public function index(Request $request)
    {
        $kategoris = Kategori::where('is_aktif', true)
            ->with(['produks' => function ($q) {
                $q->where('is_tersedia', true)
                  ->with(['varians', 'modifierGroups.modifiers'])
                  ->orderBy('urutan');
            }])
            ->orderBy('urutan')
            ->get();

        $mejas = Meja::where('is_aktif', true)
            ->orderBy('nomor')
            ->get();

        // Cek apakah pengunjung datang dari scan barcode meja (?meja=1 atau ?table=1)
        $mejaQuery = $request->query('meja') ?? $request->query('table');
        $activeMeja = null;
        $activeTableOrder = null;

        if ($mejaQuery) {
            $activeMeja = Meja::where('nomor', $mejaQuery)
                ->orWhere('id', $mejaQuery)
                ->first();

            if ($activeMeja) {
                $rawOrder = Pesanan::where('meja_id', $activeMeja->id)
                    ->whereIn('status_pesanan', ['menunggu', 'diproses', 'siap'])
                    ->with('details')
                    ->latest()
                    ->first();

                if ($rawOrder) {
                    $activeTableOrder = [
                        'id' => $rawOrder->id,
                        'nomor_pesanan' => $rawOrder->nomor_pesanan,
                        'nama_pelanggan' => $rawOrder->nama_pelanggan,
                        'total' => (float) $rawOrder->total,
                        'status_pesanan' => $rawOrder->status_pesanan,
                        'status_pembayaran' => $rawOrder->status_pembayaran,
                        'created_at' => $rawOrder->created_at->format('H:i, d M Y'),
                        'items' => $rawOrder->details->map(fn($d) => [
                            'nama_produk' => $d->nama_produk,
                            'nama_varian' => $d->nama_varian,
                            'jumlah' => $d->jumlah,
                            'subtotal' => (float) $d->subtotal,
                        ]),
                    ];
                }
            }
        }

        $storeStatus = Pengaturan::isStoreOpen();
        $allSettingsFromDb = Pengaturan::all()->pluck('nilai', 'kunci')->toArray();

        $settings = array_merge([
            'nama_cafe' => 'Jelang Hari',
            'tagline' => 'Coffee & Workspace',
            'tagline_cafe' => 'Coffee & Workspace',
            'alamat' => 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181',
            'alamat_cafe' => 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181',
            'telepon' => '0821-1594-1156',
            'telepon_cafe' => '0821-1594-1156',
            'email' => 'jelangharikopi@gmail.com',
            'instagram' => '@Jelanghari_newchapter',
            'tiktok' => '@Jelangharicoffee',
            'maps_url' => 'https://maps.google.com/?q=Jl.+AH+Nasution+No+293,+Mangkubumi,+Tasikmalaya',
            'deskripsi_footer' => 'Secangkir tenang, fokus tanpa batas. Menemani langkah produktif dan momen berhargamu di Tasikmalaya sejak pagi hingga larut malam.',
            'wifi_ssid' => 'JelangHari_Workspace',
            'wifi_password' => 'ngopidulu123',
            'pajak_persen' => 0,
            'service_persen' => 0,
            'reservasi_aktif' => '1',
            'reservasi_jam_buka' => '09:00',
            'reservasi_jam_tutup' => '22:00',
            'reservasi_min_dp' => 0,
            'reservasi_maks_durasi' => 2,
            'reservasi_syarat' => 'Harap hadir tepat waktu. Meja akan ditahan maksimal 20 menit setelah jam reservasi.',
            'reservasi_wa_admin' => '0821-1594-1156',
        ], $allSettingsFromDb, [
            'jam_buka' => $storeStatus['jam_buka'],
            'jam_tutup' => $storeStatus['jam_tutup'],
            'is_toko_buka' => (bool) $storeStatus['is_open'],
            'pesan_toko_tutup' => $storeStatus['pesan'],
            'status_operasional_toko' => $storeStatus['status_mode'],
            'midtrans_enabled' => MidtransService::isEnabled(),
            'midtrans_client_key' => MidtransService::getClientKey(),
            'midtrans_is_production' => MidtransService::isProduction(),
        ]);

        // Pastikan alias konsisten baik dipanggil dengan atau tanpa suffix _cafe
        $taglineVal = $settings['tagline'] ?? $settings['tagline_cafe'] ?? 'Coffee & Workspace';
        $settings['tagline'] = $taglineVal;
        $settings['tagline_cafe'] = $taglineVal;

        $alamatVal = $settings['alamat'] ?? $settings['alamat_cafe'] ?? 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181';
        $settings['alamat'] = $alamatVal;
        $settings['alamat_cafe'] = $alamatVal;

        $teleponVal = $settings['telepon'] ?? $settings['telepon_cafe'] ?? '0821-1594-1156';
        $settings['telepon'] = $teleponVal;
        $settings['telepon_cafe'] = $teleponVal;

        $user = auth()->user();
        $customerPoin = 0;
        $customerOrders = [];

        if ($user) {
            $customerRecord = \App\Models\Customer::where('email', $user->email)
                ->when($user->telepon, fn($q) => $q->orWhere('telepon', $user->telepon))
                ->first();
            $customerPoin = $customerRecord ? (int) $customerRecord->poin : 0;

            $customerOrders = Pesanan::where(function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                    if ($user->telepon) {
                        $q->orWhere('telepon_pelanggan', $user->telepon);
                    }
                })
                ->with(['details', 'meja'])
                ->latest()
                ->take(15)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'nomor_pesanan' => $p->nomor_pesanan,
                    'total' => (float) $p->total,
                    'subtotal' => (float) $p->subtotal,
                    'diskon' => (float) $p->diskon,
                    'status_pesanan' => $p->status_pesanan,
                    'status_pembayaran' => $p->status_pembayaran,
                    'tipe_pesanan' => $p->tipe_pesanan,
                    'meja_nomor' => $p->meja?->nomor,
                    'created_at' => $p->created_at->format('d M Y, H:i'),
                    'details' => $p->details->map(fn($d) => [
                        'id' => $d->id,
                        'nama_produk' => $d->nama_produk,
                        'nama_varian' => $d->nama_varian,
                        'jumlah' => $d->jumlah,
                        'subtotal' => (float) $d->subtotal,
                        'catatan_khusus' => $d->catatan_khusus,
                    ]),
                ]);
        }

        return Inertia::render('Welcome', [
            'kategoris' => $kategoris,
            'mejas' => $mejas,
            'activeMeja' => $activeMeja,
            'activeTableOrder' => $activeTableOrder,
            'settings' => $settings,
            'isLoggedIn' => auth()->check(),
            'userName' => $user?->name,
            'userRole' => $user?->role,
            'userEmail' => $user?->email,
            'userTelepon' => $user?->telepon,
            'customerPoin' => $customerPoin,
            'customerOrders' => $customerOrders,
        ]);
    }

    public function about()
    {
        $allSettings = Pengaturan::all()->pluck('nilai', 'kunci')->toArray();
        $settings = array_merge([
            'nama_cafe' => 'Jelang Hari',
            'tagline' => 'Coffee & Workspace',
            'tagline_cafe' => 'Coffee & Workspace',
            'alamat' => 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181',
            'alamat_cafe' => 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181',
            'telepon' => '0821-1594-1156',
            'telepon_cafe' => '0821-1594-1156',
            'email' => 'jelangharikopi@gmail.com',
            'instagram' => '@Jelanghari_newchapter',
            'tiktok' => '@Jelangharicoffee',
            'maps_url' => 'https://maps.google.com/?q=Jl.+AH+Nasution+No+293,+Mangkubumi,+Tasikmalaya',
            'deskripsi_footer' => 'Secangkir tenang, fokus tanpa batas. Menemani langkah produktif dan momen berhargamu di Tasikmalaya sejak pagi hingga larut malam.',
            'wifi_ssid' => 'JelangHari_Workspace',
            'wifi_password' => 'ngopidulu123',
        ], $allSettings);

        $taglineVal = $settings['tagline'] ?? $settings['tagline_cafe'] ?? 'Coffee & Workspace';
        $settings['tagline'] = $taglineVal;
        $settings['tagline_cafe'] = $taglineVal;

        $alamatVal = $settings['alamat'] ?? $settings['alamat_cafe'] ?? 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181';
        $settings['alamat'] = $alamatVal;
        $settings['alamat_cafe'] = $alamatVal;

        $teleponVal = $settings['telepon'] ?? $settings['telepon_cafe'] ?? '0821-1594-1156';
        $settings['telepon'] = $teleponVal;
        $settings['telepon_cafe'] = $teleponVal;

        return Inertia::render('About', [
            'settings' => $settings,
            'isLoggedIn' => auth()->check(),
            'userName' => auth()->user()?->name,
            'userRole' => auth()->user()?->role,
        ]);
    }

    public function customerOrder(Request $request, StockService $stockService)
    {
        $storeStatus = Pengaturan::isStoreOpen();
        if (!$storeStatus['is_open']) {
            return response()->json([
                'success' => false,
                'message' => $storeStatus['pesan'] ?? 'Mohon maaf, kafe saat ini sedang tutup dan belum menerima pesanan online.',
            ], 422);
        }

        // Cek Kebijakan Pemesanan Tamu (Guest Checkout)
        $guestCheckoutAllowed = (Pengaturan::where('kunci', 'guest_checkout_enabled')->value('nilai') === '1');
        if (!auth()->check() && !$guestCheckoutAllowed) {
            return response()->json([
                'success' => false,
                'require_login' => true,
                'message' => 'Silakan masuk atau buat akun terlebih dahulu untuk melanjutkan pemesanan online.',
            ], 401);
        }

        if ($request->input('tipe_pesanan') === 'takeaway') {
            $request->merge(['tipe_pesanan' => 'take_away']);
        }

        $validated = $request->validate([
            'tipe_pesanan' => 'required|in:dine_in,take_away',
            'meja_id' => 'nullable|exists:mejas,id',
            'nama_pelanggan' => 'required|string|max:100',
            'telepon_pelanggan' => 'required|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:produks,id',
            'items.*.nama_produk' => 'required|string',
            'items.*.varian_id' => 'nullable|exists:varians,id',
            'items.*.nama_varian' => 'nullable|string',
            'items.*.harga_satuan' => 'required|numeric|min:0',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.subtotal' => 'required|numeric|min:0',
            'items.*.catatan_khusus' => 'nullable|string',
            'items.*.modifiers' => 'nullable|array',
            'subtotal' => 'required|numeric|min:0',
            'diskon' => 'nullable|numeric|min:0',
            'voucher_kode' => 'nullable|string',
            'pajak_persen' => 'nullable|numeric|min:0',
            'pajak_nominal' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metode_pembayaran' => 'required|string|max:50',
            'catatan' => 'nullable|string',
        ]);

        $methodLower = strtolower($validated['metode_pembayaran']);
        $isCash = in_array($methodLower, ['cash', 'tunai']);
        $isMidtransActive = !$isCash && MidtransService::isEnabled() && !empty(MidtransService::getServerKey());

        $pesanan = DB::transaction(function () use ($validated, $stockService, $isMidtransActive, $isCash) {
            $isPaidDirectly = !$isMidtransActive && ($validated['metode_pembayaran'] === 'qris' || $isCash);

            $pesanan = Pesanan::create([
                'nomor_pesanan' => Pesanan::generateNomor(),
                'user_id' => auth()->id(), // Terhubung otomatis jika user login
                'meja_id' => $validated['tipe_pesanan'] === 'dine_in' ? ($validated['meja_id'] ?? null) : null,
                'nama_pelanggan' => $validated['nama_pelanggan'],
                'telepon_pelanggan' => $validated['telepon_pelanggan'],
                'tipe_pesanan' => $validated['tipe_pesanan'],
                'subtotal' => $validated['subtotal'],
                'diskon' => $validated['diskon'] ?? 0,
                'voucher_kode' => $validated['voucher_kode'] ?? null,
                'pajak_persen' => $validated['pajak_persen'] ?? 10,
                'pajak_nominal' => $validated['pajak_nominal'] ?? 0,
                'total' => $validated['total'],
                'bayar' => $isPaidDirectly ? $validated['total'] : 0,
                'kembalian' => 0,
                'metode_pembayaran' => $validated['metode_pembayaran'],
                'status_pembayaran' => $isPaidDirectly ? 'paid' : 'unpaid',
                'status_pesanan' => 'menunggu',
                'catatan' => $validated['catatan'] ?? 'Order via Web Customer',
                'waktu_bayar' => $isPaidDirectly ? now() : null,
            ]);

            foreach ($validated['items'] as $itemData) {
                $detail = DetailPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $itemData['produk_id'],
                    'varian_id' => $itemData['varian_id'] ?? null,
                    'nama_produk' => $itemData['nama_produk'],
                    'nama_varian' => $itemData['nama_varian'] ?? null,
                    'harga_satuan' => $itemData['harga_satuan'],
                    'jumlah' => $itemData['jumlah'],
                    'subtotal' => $itemData['subtotal'],
                    'catatan_khusus' => $itemData['catatan_khusus'] ?? null,
                    'status_kds' => 'menunggu',
                ]);

                if (!empty($itemData['modifiers'])) {
                    foreach ($itemData['modifiers'] as $modData) {
                        DetailPesananModifier::create([
                            'detail_pesanan_id' => $detail->id,
                            'modifier_id' => $modData['modifier_id'],
                            'nama_modifier' => $modData['nama'],
                            'harga_tambahan' => $modData['harga'],
                        ]);
                    }
                }
            }

            if (!empty($validated['meja_id']) && $validated['tipe_pesanan'] === 'dine_in') {
                Meja::where('id', $validated['meja_id'])->update(['status' => 'terisi']);
            }

            if (!empty($validated['voucher_kode'])) {
                Voucher::where('kode', $validated['voucher_kode'])->increment('terpakai');
            }

            $stockService->potongStokPesanan($pesanan);

            return $pesanan;
        });

        $pesanan->load(['details.modifiers', 'meja']);

        $snapToken = null;
        $snapRedirectUrl = null;
        if ($isMidtransActive) {
            $snapResult = MidtransService::createSnapToken($pesanan);
            if (!empty($snapResult['snap_token'])) {
                $snapToken = $snapResult['snap_token'];
                $snapRedirectUrl = $snapResult['redirect_url'] ?? null;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dikirim ke kasir & barista!',
            'pesanan' => $pesanan,
            'snap_token' => $snapToken,
            'snap_redirect_url' => $snapRedirectUrl,
            'client_key' => MidtransService::getClientKey(),
            'is_production' => MidtransService::isProduction(),
        ]);
    }

    public function trackOrder(Request $request)
    {
        $nomor = $request->query('nomor');
        if (!$nomor) {
            return response()->json(['found' => false], 404);
        }

        $pesanan = Pesanan::with(['details.modifiers', 'meja'])
            ->where('nomor_pesanan', strtoupper(trim($nomor)))
            ->orWhere('telepon_pelanggan', trim($nomor))
            ->latest()
            ->first();

        if (!$pesanan) {
            return response()->json(['found' => false, 'message' => 'Pesanan tidak ditemukan.'], 404);
        }

        return response()->json([
            'found' => true,
            'pesanan' => $pesanan,
        ]);
    }

    public function storeStatus()
    {
        $storeStatus = Pengaturan::isStoreOpen();
        return response()->json([
            'is_open' => (bool) $storeStatus['is_open'],
            'jam_buka' => $storeStatus['jam_buka'],
            'jam_tutup' => $storeStatus['jam_tutup'],
            'status_mode' => $storeStatus['status_mode'],
            'pesan' => $storeStatus['pesan'],
            'server_time' => now()->setTimezone('Asia/Jakarta')->format('H:i'),
        ]);
    }

    public function submitReservation(Request $request)
    {
        $reservasiAktif = Pengaturan::get('reservasi_aktif', '1');
        if ($reservasiAktif !== '1') {
            return response()->json([
                'success' => false,
                'message' => 'Mohon maaf, layanan booking dan reservasi online sedang ditutup sementara.'
            ], 422);
        }

        $validated = $request->validate([
            'nama_pemesan' => 'required|string|max:100',
            'telepon' => 'required|string|max:25',
            'tanggal' => 'required|date|after_or_equal:today',
            'jam' => 'required|string',
            'durasi_jam' => 'required|integer|min:1|max:12',
            'jumlah_orang' => 'required|integer|min:1|max:50',
            'meja_id' => 'nullable|exists:mejas,id',
            'catatan' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $validated['user_id'] = $user?->id;
        $validated['status'] = 'menunggu';
        $validated['dp_nominal'] = 0;

        $reservasi = Reservasi::create($validated);
        $meja = $reservasi->meja;

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan reservasi berhasil dikirim! Tim Jelang Hari akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi.',
            'data' => [
                'id' => $reservasi->id,
                'nama_pemesan' => $reservasi->nama_pemesan,
                'tanggal' => $reservasi->tanggal ? $reservasi->tanggal->format('d M Y') : $validated['tanggal'],
                'jam' => $reservasi->jam,
                'jumlah_orang' => $reservasi->jumlah_orang,
                'meja_nomor' => $meja?->nomor ?? 'Bebas',
                'wa_admin' => Pengaturan::get('reservasi_wa_admin', '0821-1594-1156'),
            ],
        ]);
    }

    public function myOrders()
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['orders' => []], 401);
        }

        $orders = Pesanan::where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->telepon) {
                    $q->orWhere('telepon_pelanggan', $user->telepon);
                }
            })
            ->with(['details', 'meja'])
            ->latest()
            ->take(15)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nomor_pesanan' => $p->nomor_pesanan,
                'total' => (float) $p->total,
                'subtotal' => (float) $p->subtotal,
                'diskon' => (float) $p->diskon,
                'status_pesanan' => $p->status_pesanan,
                'status_pembayaran' => $p->status_pembayaran,
                'tipe_pesanan' => $p->tipe_pesanan,
                'meja_nomor' => $p->meja?->nomor,
                'created_at' => $p->created_at->format('d M Y, H:i'),
                'details' => $p->details->map(fn($d) => [
                    'id' => $d->id,
                    'nama_produk' => $d->nama_produk,
                    'nama_varian' => $d->nama_varian,
                    'jumlah' => $d->jumlah,
                    'subtotal' => (float) $d->subtotal,
                    'catatan_khusus' => $d->catatan_khusus,
                ]),
            ]);

        return response()->json(['orders' => $orders]);
    }

    /**
     * Webhook Handler resmi dari Midtrans (Settlement / Pending / Cancel / Expire)
     */
    public function midtransNotification(Request $request)
    {
        $payload = $request->all();
        Log::info('Midtrans Webhook Payload: ', $payload);

        $orderId = $payload['order_id'] ?? null;
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signatureKey = (string) ($payload['signature_key'] ?? '');
        $transactionStatus = (string) ($payload['transaction_status'] ?? '');

        if (!$orderId || !$statusCode || !$grossAmount || !$signatureKey) {
            return response()->json(['message' => 'Invalid webhook payload'], 400);
        }

        if (!MidtransService::verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning('Midtrans Webhook: Signature verification failed for order ' . $orderId);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // Ambil nomor pesanan asli (format: ORD-YYYYMMDD-XXXXX-timestamp)
        $parts = explode('-', $orderId);
        if (count($parts) > 3) {
            array_pop($parts); // Hapus timestamp suffix
            $nomorPesanan = implode('-', $parts);
        } else {
            $nomorPesanan = $orderId;
        }

        $pesanan = Pesanan::where('nomor_pesanan', $nomorPesanan)
            ->orWhere('nomor_pesanan', $orderId)
            ->first();

        if (!$pesanan) {
            Log::warning('Midtrans Webhook: Pesanan tidak ditemukan: ' . $orderId);
            return response()->json(['message' => 'Pesanan not found'], 404);
        }

        if (in_array($transactionStatus, ['capture', 'settlement'])) {
            $pesanan->update([
                'status_pembayaran' => 'paid',
                'bayar' => $pesanan->total,
                'waktu_bayar' => now(),
            ]);
            Log::info("Midtrans Webhook: Pesanan {$nomorPesanan} berhasil DILUNASI otomatis via QRIS/VA.");
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $pesanan->update([
                'status_pembayaran' => 'unpaid',
            ]);
            Log::info("Midtrans Webhook: Pesanan {$nomorPesanan} dibatalkan/kadaluarsa ({$transactionStatus}).");
        }

        return response()->json(['status' => 'OK']);
    }

    /**
     * Dapatkan atau generate ulang Snap Token untuk pesanan yang belum bayar
     */
    public function getSnapToken(string $nomor_pesanan)
    {
        $pesanan = Pesanan::with(['details', 'meja'])
            ->where('nomor_pesanan', strtoupper(trim($nomor_pesanan)))
            ->first();

        if (!$pesanan) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan'], 404);
        }

        if ($pesanan->status_pembayaran === 'paid') {
            return response()->json(['success' => false, 'message' => 'Pesanan ini sudah lunas'], 400);
        }

        $snapResult = MidtransService::createSnapToken($pesanan);

        return response()->json($snapResult);
    }
}
