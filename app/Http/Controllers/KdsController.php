<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\DetailPesanan;
use App\Models\BahanBaku;
use App\Models\Produk;
use App\Models\ProdukBahan;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KdsController extends Controller
{
    public function index(Request $request)
    {
        $station = $request->query('station', 'all'); // 'all', 'barista', 'kitchen'

        $orders = Pesanan::with(['meja', 'user', 'details.modifiers', 'details.produk.resep.bahanBaku', 'details.produk.kategori'])
            ->whereIn('status_pesanan', ['menunggu', 'diproses', 'siap'])
            ->where(function ($q) {
                $q->where('status_pembayaran', 'paid')
                  ->orWhereIn('metode_pembayaran', ['cash', 'tunai']);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        $historyOrders = Pesanan::with(['meja', 'user', 'details.modifiers', 'details.produk.resep.bahanBaku', 'details.produk.kategori'])
            ->where('status_pesanan', 'selesai')
            ->where(function ($q) {
                $q->where('status_pembayaran', 'paid')
                  ->orWhereIn('metode_pembayaran', ['cash', 'tunai']);
            })
            ->orderBy('updated_at', 'desc')
            ->limit(40)
            ->get();

        // If station filter applied, filter items
        if ($station !== 'all') {
            $filterClosure = function ($order) use ($station) {
                $order->setRelation('details', $order->details->filter(function ($item) use ($station) {
                    return $item->produk && $item->produk->station === $station;
                }));
                return $order->details->isNotEmpty();
            };

            $orders = $orders->filter($filterClosure)->values();
            $historyOrders = $historyOrders->filter($filterClosure)->values();
        }

        $bahanBakus = BahanBaku::orderBy('nama')->get();
        $allProduks = Produk::with(['resep.bahanBaku', 'kategori'])->orderBy('nama')->get();

        // Ambil custom SOP instruksi racik jika ada
        $customSops = Pengaturan::where('kategori', 'kds_sop')
            ->get()
            ->mapWithKeys(function ($p) {
                $val = json_decode($p->nilai, true);
                return [$p->kunci => $val ?? []];
            })
            ->toArray();

        return Inertia::render('Kds/Index', [
            'orders' => $orders,
            'historyOrders' => $historyOrders,
            'currentStation' => $station,
            'bahanBakus' => $bahanBakus,
            'allProduks' => $allProduks,
            'customSops' => $customSops,
        ]);
    }

    public function updateItemStatus(Request $request, DetailPesanan $item)
    {
        $request->validate([
            'status' => 'required|in:menunggu,diproses,siap,disajikan',
        ]);

        $item->update(['status_kds' => $request->status]);

        // Check if all items in order are ready or served
        $pesanan = $item->pesanan;
        $allReady = $pesanan->details()->where('status_kds', '!=', 'siap')->where('status_kds', '!=', 'disajikan')->doesntExist();
        if ($allReady && $pesanan->status_pesanan === 'diproses') {
            $pesanan->update(['status_pesanan' => 'siap']);
        }

        return back();
    }

    public function completeOrder(Pesanan $pesanan)
    {
        $pesanan->update([
            'status_pesanan' => 'selesai',
            'waktu_selesai' => now(),
        ]);

        $pesanan->details()->update(['status_kds' => 'disajikan']);

        if ($pesanan->meja_id) {
            $pesanan->meja->update(['status' => 'kosong']);
        }

        return back();
    }

    public function updateOrderStatus(Request $request, Pesanan $pesanan)
    {
        $request->validate([
            'status' => 'required|in:menunggu,diproses,siap,selesai',
        ]);

        $status = $request->status;
        $pesanan->update(['status_pesanan' => $status]);

        if ($status === 'diproses') {
            $pesanan->details()->update(['status_kds' => 'diproses']);
        } elseif ($status === 'siap') {
            $pesanan->details()->update(['status_kds' => 'siap']);
        } elseif ($status === 'selesai') {
            $pesanan->update(['waktu_selesai' => now()]);
            $pesanan->details()->update(['status_kds' => 'disajikan']);
            if ($pesanan->meja_id) {
                $pesanan->meja->update(['status' => 'kosong']);
            }
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'status' => $status]);
        }

        return back()->with('success', "Status pesanan #{$pesanan->nomor_pesanan} berhasil diperbarui.");
    }

    public function fetchOrders(Request $request)
    {
        $station = $request->query('station', 'all');
        $tab = $request->query('tab', 'all');

        $filterClosure = function ($order) use ($station) {
            $order->setRelation('details', $order->details->filter(function ($item) use ($station) {
                return $item->produk && $item->produk->station === $station;
            }));
            return $order->details->isNotEmpty();
        };

        if ($tab === 'all') {
            $activeOrders = Pesanan::with(['meja', 'user', 'details.modifiers', 'details.produk.resep.bahanBaku', 'details.produk.kategori'])
                ->whereIn('status_pesanan', ['menunggu', 'diproses', 'siap'])
                ->where(function ($q) {
                    $q->where('status_pembayaran', 'paid')
                      ->orWhereIn('metode_pembayaran', ['cash', 'tunai']);
                })
                ->orderBy('created_at', 'asc')
                ->get();

            $historyOrders = Pesanan::with(['meja', 'user', 'details.modifiers', 'details.produk.resep.bahanBaku', 'details.produk.kategori'])
                ->where('status_pesanan', 'selesai')
                ->where(function ($q) {
                    $q->where('status_pembayaran', 'paid')
                      ->orWhereIn('metode_pembayaran', ['cash', 'tunai']);
                })
                ->orderBy('updated_at', 'desc')
                ->limit(40)
                ->get();

            if ($station !== 'all') {
                $activeOrders = $activeOrders->filter($filterClosure)->values();
                $historyOrders = $historyOrders->filter($filterClosure)->values();
            }

            return response()->json([
                'active' => $activeOrders,
                'history' => $historyOrders,
            ]);
        }

        if ($tab === 'history') {
            $orders = Pesanan::with(['meja', 'user', 'details.modifiers', 'details.produk.resep.bahanBaku', 'details.produk.kategori'])
                ->where('status_pesanan', 'selesai')
                ->where(function ($q) {
                    $q->where('status_pembayaran', 'paid')
                      ->orWhereIn('metode_pembayaran', ['cash', 'tunai']);
                })
                ->orderBy('updated_at', 'desc')
                ->limit(40)
                ->get();
        } else {
            $orders = Pesanan::with(['meja', 'user', 'details.modifiers', 'details.produk.resep.bahanBaku', 'details.produk.kategori'])
                ->whereIn('status_pesanan', ['menunggu', 'diproses', 'siap'])
                ->where(function ($q) {
                    $q->where('status_pembayaran', 'paid')
                      ->orWhereIn('metode_pembayaran', ['cash', 'tunai']);
                })
                ->orderBy('created_at', 'asc')
                ->get();
        }

        if ($station !== 'all') {
            $orders = $orders->filter($filterClosure)->values();
        }

        return response()->json($orders);
    }

    public function reopenOrder(Pesanan $pesanan)
    {
        $pesanan->update([
            'status_pesanan' => 'siap',
            'waktu_selesai' => null,
        ]);

        $pesanan->details()->update(['status_kds' => 'siap']);

        if ($pesanan->meja_id) {
            $pesanan->meja->update(['status' => 'terisi']);
        }

        return back()->with('success', "Pesanan #{$pesanan->nomor_pesanan} dikembalikan ke antrean KDS.");
    }

    public function cancelOrder(Request $request, Pesanan $pesanan)
    {
        $request->validate([
            'alasan' => 'nullable|string|max:255',
        ]);

        $alasan = $request->input('alasan', 'Dibatalkan oleh staf KDS / Kitchen');
        $oldCatatan = $pesanan->catatan ? $pesanan->catatan . " | " : "";

        $pesanan->update([
            'status_pesanan' => 'dibatalkan',
            'catatan' => $oldCatatan . "[Dibatalkan KDS: {$alasan}]",
        ]);

        $pesanan->details()->update(['status_kds' => 'dibatalkan']);

        if ($pesanan->meja_id) {
            $pesanan->meja->update(['status' => 'kosong']);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Pesanan #{$pesanan->nomor_pesanan} berhasil dibatalkan.",
            ]);
        }

        return back()->with('success', "Pesanan #{$pesanan->nomor_pesanan} berhasil dibatalkan.");
    }

    /**
     * Update Resep & SOP Racikan dari Layar KDS Kitchen/Barista
     */
    public function updateResep(Request $request, Produk $produk)
    {
        $rawResep = is_array($request->resep) ? $request->resep : [];
        $validResep = [];
        foreach ($rawResep as $item) {
            if (!empty($item['bahan_baku_id']) && isset($item['jumlah_pemakaian']) && (float)$item['jumlah_pemakaian'] > 0) {
                // Pastikan bahan baku memang ada di database
                if (BahanBaku::where('id', $item['bahan_baku_id'])->exists()) {
                    $validResep[] = [
                        'bahan_baku_id' => (int) $item['bahan_baku_id'],
                        'jumlah_pemakaian' => (float) $item['jumlah_pemakaian'],
                    ];
                }
            }
        }

        DB::transaction(function () use ($validResep, $request, $produk) {
            // 1. Sync Bahan Baku (BOM)
            $produk->resep()->delete();
            foreach ($validResep as $item) {
                ProdukBahan::create([
                    'produk_id' => $produk->id,
                    'bahan_baku_id' => $item['bahan_baku_id'],
                    'jumlah_pemakaian' => $item['jumlah_pemakaian'],
                ]);
            }

            // 2. Simpan SOP Instruksi Racik ke Pengaturan
            if ($request->has('instruksi_racik') && is_array($request->instruksi_racik)) {
                $steps = array_values(array_filter(
                    $request->instruksi_racik,
                    fn($s) => !empty(trim((string)$s))
                ));
                Pengaturan::set("resep_sop_{$produk->id}", $steps, 'kds_sop', 'json');
            }
        });

        $produk->load('resep.bahanBaku');
        $sops = Pengaturan::get("resep_sop_{$produk->id}", []);

        return response()->json([
            'success' => true,
            'message' => "Resep & SOP {$produk->nama} berhasil disimpan.",
            'produk' => $produk,
            'instruksi_racik' => $sops,
        ]);
    }

    /**
     * Ambil data resep & SOP produk spesifik (JSON)
     */
    public function getResep(Produk $produk)
    {
        $produk->load('resep.bahanBaku');
        $sops = Pengaturan::get("resep_sop_{$produk->id}", []);

        return response()->json([
            'produk' => $produk,
            'resep' => $produk->resep,
            'instruksi_racik' => $sops,
        ]);
    }
}

