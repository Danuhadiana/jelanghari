<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Kategori;
use App\Models\Produk;
use App\Models\Meja;
use App\Models\Pesanan;
use App\Models\DetailPesanan;
use App\Models\DetailPesananModifier;
use App\Models\Pengaturan;
use App\Models\Voucher;
use App\Models\ShiftKasir;
use App\Services\StockService;
use App\Services\PrinterService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class KasirController extends Controller
{
    public function index()
    {
        $kategoris = Kategori::where('is_aktif', true)->orderBy('urutan')->get();

        $produks = Produk::with(['kategori', 'varians', 'modifierGroups.modifiers'])
            ->where('is_tersedia', true)
            ->orderBy('urutan')
            ->get();

        $mejas = Meja::where('is_aktif', true)->orderBy('nomor')->get();

        $rawMetodeList = Pengaturan::get('kasir_metode_pembayaran_custom', null);
        $metodeList = null;
        if ($rawMetodeList) {
            $metodeList = json_decode($rawMetodeList, true);
        }
        if (!is_array($metodeList) || empty($metodeList)) {
            $metodeList = [
                [
                    'id' => 'cash',
                    'nama' => 'Tunai (Cash)',
                    'tipe' => 'cash',
                    'keterangan' => 'Uang tunai kasir',
                    'is_aktif' => Pengaturan::get('kasir_metode_cash', '1') === '1',
                ],
                [
                    'id' => 'qris',
                    'nama' => 'QRIS',
                    'tipe' => 'non_cash',
                    'keterangan' => Pengaturan::get('kasir_qris_nama', 'QRIS Jelang Hari (All E-Wallet / Bank)'),
                    'is_aktif' => Pengaturan::get('kasir_metode_qris', '1') === '1',
                ],
                [
                    'id' => 'debit',
                    'nama' => 'Kartu Debit',
                    'tipe' => 'non_cash',
                    'keterangan' => Pengaturan::get('kasir_debit_nama', 'EDC Mandiri / BCA'),
                    'is_aktif' => Pengaturan::get('kasir_metode_debit', '1') === '1',
                ],
                [
                    'id' => 'transfer',
                    'nama' => 'Transfer Bank',
                    'tipe' => 'non_cash',
                    'keterangan' => Pengaturan::get('kasir_transfer_bank', 'BCA 1234567890 a.n Jelang Hari'),
                    'is_aktif' => Pengaturan::get('kasir_metode_transfer', '1') === '1',
                ],
            ];
        }

        $pengaturan = [
            'nama_cafe' => Pengaturan::get('nama_cafe', 'JELANG HARI'),
            'alamat_cafe' => Pengaturan::get('alamat_cafe', 'Jl. AH Nasution No 293, Mangkubumi'),
            'telepon_cafe' => Pengaturan::get('telepon_cafe', '0812-3456-7890'),
            'pajak_persen' => (float) Pengaturan::get('pajak_persen', 10),
            'service_charge_persen' => (float) Pengaturan::get('service_charge_persen', 0),
            'pembulatan' => Pengaturan::get('pembulatan', true),
            'footer_struk' => Pengaturan::get('footer_struk', 'Terima kasih atas kunjungan Anda!'),
            'wifi_ssid' => Pengaturan::get('wifi_ssid', 'JelangHari_Guest'),
            'wifi_password' => Pengaturan::get('wifi_password', 'kopidanfokus'),
            'metode_pembayaran_list' => $metodeList,
            'metode_cash' => Pengaturan::get('kasir_metode_cash', '1') === '1',
            'metode_qris' => Pengaturan::get('kasir_metode_qris', '1') === '1',
            'metode_debit' => Pengaturan::get('kasir_metode_debit', '1') === '1',
            'metode_transfer' => Pengaturan::get('kasir_metode_transfer', '1') === '1',
            'qris_nama' => Pengaturan::get('kasir_qris_nama', 'QRIS Jelang Hari'),
            'transfer_bank' => Pengaturan::get('kasir_transfer_bank', 'BCA 123456789 a.n Jelang Hari'),
            'debit_nama' => Pengaturan::get('kasir_debit_nama', 'EDC Mandiri / BCA'),
        ];

        $activeShift = ShiftKasir::where('user_id', auth()->id())
            ->where('status', 'aktif')
            ->latest()
            ->first();

        $customers = Customer::select('id', 'nama', 'telepon', 'email', 'poin')
            ->orderBy('nama')
            ->get();

        return Inertia::render('Kasir/Index', [
            'kategoris' => $kategoris,
            'kategori' => $kategoris,
            'produks' => $produks,
            'produk' => $produks,
            'mejas' => $mejas,
            'meja' => $mejas,
            'customers' => $customers,
            'pengaturan' => $pengaturan,
            'activeShift' => $activeShift,
            'active_shift' => $activeShift,
        ]);
    }

    public function customers(Request $request)
    {
        $search = $request->query('search');
        $customers = Customer::select('id', 'nama', 'telepon', 'email', 'poin')
            ->when($search, function ($q, $search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('telepon', 'like', "%{$search}%");
            })
            ->orderBy('nama')
            ->take(50)
            ->get();

        return response()->json($customers);
    }

    public function quickRegisterCustomer(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'telepon' => 'required|string|max:20|unique:customers,telepon',
            'email' => 'nullable|email|max:100',
        ], [
            'telepon.unique' => 'Nomor WhatsApp sudah terdaftar sebagai member.',
        ]);

        $customer = Customer::create([
            'nama' => $validated['nama'],
            'telepon' => $validated['telepon'],
            'email' => $validated['email'] ?? null,
            'poin' => 25, // Bonus selamat datang
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member baru berhasil didaftarkan dengan 25 bonus poin perdana!',
            'customer' => $customer,
        ]);
    }

    public function checkout(Request $request, StockService $stockService)
    {
        // 1. Normalisasi tipe pesanan (dine_in, take_away, delivery)
        $tipe = $request->input('tipe_pesanan') ?: $request->input('tipe') ?: 'dine_in';
        if ($tipe === 'takeaway') {
            $tipe = 'take_away';
        }

        // 2. Normalisasi metode pembayaran
        $metode = $request->input('metode_pembayaran') ?: $request->input('metode_bayar') ?: $request->input('metode') ?: 'cash';

        // 3. Normalisasi items
        $itemsRaw = $request->input('items', []);
        if (empty($itemsRaw)) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Keranjang pesanan masih kosong.'], 422);
            }
            return back()->withErrors(['items' => 'Keranjang pesanan masih kosong.']);
        }

        $formattedItems = [];
        $calculatedSubtotal = 0;

        foreach ($itemsRaw as $it) {
            $prodId = $it['produk_id'] ?? null;
            if (!$prodId) continue;

            $produk = Produk::find($prodId);
            if (!$produk) continue;

            $varianId = $it['varian_id'] ?? null;
            $namaVarian = $it['nama_varian'] ?? null;
            $harga = isset($it['harga_satuan']) ? (float) $it['harga_satuan'] : (float) $produk->harga;
            if ($varianId && !$namaVarian) {
                $var = $produk->varians()->find($varianId);
                if ($var) {
                    $namaVarian = $var->nama;
                    if (!isset($it['harga_satuan'])) $harga = (float) $var->harga;
                }
            }

            $qty = (int) ($it['jumlah'] ?? $it['qty'] ?? 1);
            $itemSubtotal = isset($it['subtotal']) ? (float) $it['subtotal'] : ($harga * $qty);
            $calculatedSubtotal += $itemSubtotal;

            $modifiers = [];
            if (!empty($it['modifiers'])) {
                foreach ($it['modifiers'] as $m) {
                    $modifiers[] = [
                        'modifier_id' => $m['modifier_id'] ?? $m['id'] ?? null,
                        'nama' => $m['nama'] ?? 'Modifier',
                        'harga' => (float) ($m['harga'] ?? 0),
                    ];
                }
            }

            $formattedItems[] = [
                'produk_id' => $prodId,
                'nama_produk' => $it['nama_produk'] ?? $produk->nama,
                'varian_id' => $varianId,
                'nama_varian' => $namaVarian,
                'harga_satuan' => $harga,
                'jumlah' => $qty,
                'subtotal' => $itemSubtotal,
                'catatan_khusus' => $it['catatan_khusus'] ?? $it['catatan'] ?? null,
                'modifiers' => $modifiers,
            ];
        }

        $subtotal = (float) ($request->input('subtotal') ?: $calculatedSubtotal);
        $diskon = (float) ($request->input('diskon') ?: 0);
        $pajakPersen = (float) ($request->input('pajak_persen') ?: 0);
        $pajakNominal = (float) ($request->input('pajak_nominal') ?: round(($subtotal - $diskon) * ($pajakPersen / 100)));
        $servicePersen = (float) ($request->input('service_persen') ?: 0);
        $serviceNominal = (float) ($request->input('service_nominal') ?: round($subtotal * ($servicePersen / 100)));
        $pembulatan = (float) ($request->input('pembulatan') ?: 0);

        $total = (float) ($request->input('total') ?: max(0, $subtotal - $diskon + $pajakNominal + $serviceNominal + $pembulatan));
        $bayar = (float) ($request->input('bayar') ?: $total);
        $kembalian = (float) ($request->input('kembalian') ?: max(0, $bayar - $total));

        $pesanan = DB::transaction(function () use (
            $tipe, $metode, $formattedItems, $subtotal, $diskon, $pajakPersen, $pajakNominal,
            $servicePersen, $serviceNominal, $pembulatan, $total, $bayar, $kembalian, $request, $stockService
        ) {
            $pesanan = Pesanan::create([
                'nomor_pesanan' => Pesanan::generateNomor(),
                'user_id' => auth()->id(),
                'meja_id' => $request->input('meja_id') ?: null,
                'nama_pelanggan' => $request->input('nama_pelanggan') ?: 'Walk-in Guest',
                'telepon_pelanggan' => $request->input('telepon_pelanggan') ?: null,
                'tipe_pesanan' => $tipe,
                'subtotal' => $subtotal,
                'diskon' => $diskon,
                'voucher_kode' => $request->input('voucher_kode') ?: null,
                'pajak_persen' => $pajakPersen,
                'pajak_nominal' => $pajakNominal,
                'service_persen' => $servicePersen,
                'service_nominal' => $serviceNominal,
                'pembulatan' => $pembulatan,
                'total' => $total,
                'bayar' => $bayar,
                'kembalian' => $kembalian,
                'metode_pembayaran' => $metode,
                'status_pembayaran' => 'paid',
                'status_pesanan' => 'diproses',
                'catatan' => $request->input('catatan') ?: null,
                'waktu_bayar' => now(),
            ]);

            // Create Detail Items
            foreach ($formattedItems as $itemData) {
                $detail = DetailPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $itemData['produk_id'],
                    'varian_id' => $itemData['varian_id'],
                    'nama_produk' => $itemData['nama_produk'],
                    'nama_varian' => $itemData['nama_varian'],
                    'harga_satuan' => $itemData['harga_satuan'],
                    'jumlah' => $itemData['jumlah'],
                    'subtotal' => $itemData['subtotal'],
                    'catatan_khusus' => $itemData['catatan_khusus'],
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

            // Update Table status
            if ($pesanan->meja_id) {
                Meja::where('id', $pesanan->meja_id)->update(['status' => 'terisi']);
            }

            // Update Voucher usage count
            if ($pesanan->voucher_kode) {
                Voucher::where('kode', $pesanan->voucher_kode)->increment('terpakai');
            }

            // Update Customer Member Points
            $targetCustomerId = $request->input('customer_id');
            $targetTelepon = $request->input('telepon_pelanggan');

            $customer = null;
            if ($targetCustomerId) {
                $customer = Customer::find($targetCustomerId);
            } elseif ($targetTelepon) {
                $customer = Customer::where('telepon', $targetTelepon)->first();
            }

            if ($customer) {
                $poinDidapat = (int) floor($total / 10000); // 1 poin per 10k belanja
                $poinTukar = (int) ($request->input('poin_tukar') ?: 0);
                $newPoin = max(0, $customer->poin - $poinTukar + $poinDidapat);
                $customer->update([
                    'poin' => $newPoin,
                    'total_transaksi' => $customer->total_transaksi + $total,
                    'kunjungan_count' => $customer->kunjungan_count + 1,
                    'terakhir_kunjung' => now(),
                ]);
            }

            // Update Shift totals
            $activeShift = ShiftKasir::where('user_id', auth()->id())
                ->where('status', 'aktif')
                ->latest()
                ->first();

            if ($activeShift) {
                $isCash = ($metode === 'cash');
                $rawCustom = Pengaturan::get('kasir_metode_pembayaran_custom', null);
                if ($rawCustom) {
                    $decoded = json_decode($rawCustom, true);
                    if (is_array($decoded)) {
                        foreach ($decoded as $m) {
                            if (($m['id'] ?? '') === $metode) {
                                $isCash = (($m['tipe'] ?? '') === 'cash');
                                break;
                            }
                        }
                    }
                }

                if ($isCash) {
                    $activeShift->increment('total_penjualan_cash', $total);
                    $activeShift->increment('kas_diharapkan', $total);
                } else {
                    $activeShift->increment('total_penjualan_non_cash', $total);
                }
            }

            // Deduct inventory safely
            try {
                $stockService->potongStokPesanan($pesanan);
            } catch (\Exception $e) {
                \Log::warning("Gagal potong stok: " . $e->getMessage());
            }

            return $pesanan;
        });

        $pesanan->load(['details.modifiers', 'meja', 'user']);
        $confirmMsg = "Pesanan #{$pesanan->nomor_pesanan} Telah Dikonfirmasi!";

        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('kasir.index')->with([
                'success' => $confirmMsg,
                'last_order_id' => $pesanan->id,
                'last_order_nomor' => $pesanan->nomor_pesanan,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $confirmMsg,
            'pesanan' => $pesanan,
            'last_order_id' => $pesanan->id,
            'last_order_nomor' => $pesanan->nomor_pesanan,
        ]);
    }

    public function strukJson($id)
    {
        $pesanan = Pesanan::with(['details.modifiers', 'meja', 'user'])
            ->where('id', $id)
            ->orWhere('nomor_pesanan', $id)
            ->firstOrFail();

        $customer = null;
        if ($pesanan->telepon_pelanggan) {
            $customer = Customer::where('telepon', $pesanan->telepon_pelanggan)->first();
        }

        $memberData = $customer ? [
            'id' => $customer->id,
            'nama' => $customer->nama,
            'telepon' => $customer->telepon,
            'poin' => (int) $customer->poin,
            'poin_didapat' => (int) floor((float) $pesanan->total / 10000),
        ] : null;

        return response()->json([
            'order' => [
                'id' => $pesanan->id,
                'no_struk' => $pesanan->nomor_pesanan,
                'created_at' => $pesanan->created_at ? $pesanan->created_at->toIso8601String() : now()->toIso8601String(),
                'kasir' => [
                    'nama' => $pesanan->user ? ($pesanan->user->nama ?? $pesanan->user->name) : 'Kasir',
                ],
                'tipe' => $pesanan->tipe_pesanan,
                'meja' => $pesanan->meja ? ['no_meja' => $pesanan->meja->nomor] : null,
                'nama_pelanggan' => $pesanan->nama_pelanggan,
                'telepon_pelanggan' => $pesanan->telepon_pelanggan,
                'member' => $memberData,
                'items' => $pesanan->details->map(function ($d) {
                    $modText = $d->modifiers->pluck('nama_modifier')->implode(', ');
                    return [
                        'id' => $d->id,
                        'nama_produk' => $d->nama_produk,
                        'nama_varian' => $d->nama_varian,
                        'qty' => $d->jumlah,
                        'harga' => (float) $d->harga_satuan,
                        'subtotal' => (float) $d->subtotal,
                        'modifier_text' => $modText ?: null,
                        'catatan' => $d->catatan_khusus,
                    ];
                }),
                'subtotal' => (float) $pesanan->subtotal,
                'diskon' => (float) $pesanan->diskon,
                'service' => (float) $pesanan->service_nominal,
                'pajak' => (float) $pesanan->pajak_nominal,
                'pembulatan' => (float) $pesanan->pembulatan,
                'total' => (float) $pesanan->total,
                'bayar' => (float) $pesanan->bayar,
                'kembalian' => (float) $pesanan->kembalian,
                'metode_bayar' => $pesanan->metode_pembayaran,
                'status_pembayaran' => $pesanan->status_pembayaran,
                'catatan' => $pesanan->catatan,
            ],
            'cafe' => [
                'nama' => Pengaturan::get('nama_cafe', 'JELANG HARI COFFEE & WORKSPACE'),
                'alamat' => Pengaturan::get('alamat_cafe', 'Jl. AH Nasution No 293, Mangkubumi'),
                'telepon' => Pengaturan::get('telepon_cafe', '0812-3456-7890'),
                'footer' => Pengaturan::get('footer_struk', 'Terima kasih atas kunjungan Anda!'),
                'wifi_ssid' => Pengaturan::get('wifi_ssid', 'JelangHari_Guest'),
                'wifi_password' => Pengaturan::get('wifi_password', 'kopidanfokus'),
            ]
        ]);
    }

    public function publicStruk($nomor_pesanan)
    {
        $pesanan = Pesanan::with(['details.modifiers', 'meja', 'user'])
            ->where('nomor_pesanan', $nomor_pesanan)
            ->orWhere('id', $nomor_pesanan)
            ->firstOrFail();

        $cafe = [
            'nama' => Pengaturan::get('nama_cafe', 'JELANG HARI COFFEE & WORKSPACE'),
            'alamat' => Pengaturan::get('alamat_cafe', 'Jl. AH Nasution No 293, Mangkubumi'),
            'telepon' => Pengaturan::get('telepon_cafe', '0812-3456-7890'),
            'footer' => Pengaturan::get('footer_struk', 'Terima kasih atas kunjungan Anda!'),
            'wifi_ssid' => Pengaturan::get('wifi_ssid', 'JelangHari_Guest'),
            'wifi_password' => Pengaturan::get('wifi_password', 'kopidanfokus'),
        ];

        return Inertia::render('Public/DigitalReceipt', [
            'pesanan' => $pesanan,
            'cafe' => $cafe,
        ]);
    }

    public function checkVoucher(Request $request)
    {
        $request->validate(['kode' => 'required|string']);
        $voucher = Voucher::where('kode', strtoupper($request->kode))
            ->where('is_aktif', true)
            ->whereDate('tanggal_mulai', '<=', today())
            ->whereDate('tanggal_selesai', '>=', today())
            ->first();

        if (!$voucher) {
            return response()->json(['valid' => false, 'message' => 'Voucher tidak ditemukan atau sudah kedaluwarsa.'], 404);
        }

        if ($voucher->kuota > 0 && $voucher->terpakai >= $voucher->kuota) {
            return response()->json(['valid' => false, 'message' => 'Kuota voucher telah habis.'], 422);
        }

        return response()->json([
            'valid' => true,
            'voucher' => $voucher,
        ]);
    }

    public function riwayatPesanan(Request $request)
    {
        $orders = Pesanan::with(['meja', 'user', 'details.modifiers'])
            ->whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    public function riwayatShift(Request $request)
    {
        $shifts = ShiftKasir::with('user')
            ->latest('id')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'shifts' => $shifts,
        ]);
    }
}
