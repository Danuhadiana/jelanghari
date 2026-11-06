<?php

namespace App\Http\Controllers;

use App\Models\Pembelian;
use App\Models\PembelianDetail;
use App\Models\BahanBaku;
use App\Models\Supplier;
use App\Models\LogStok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PembelianController extends Controller
{
    public function index(Request $request)
    {
        $pembelians = Pembelian::with(['supplier', 'user', 'details.bahanBaku'])
            ->when($request->search, function ($q, $search) {
                $q->where('nomor_pembelian', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $suppliers = Supplier::orderBy('nama')->get();
        $bahanBakus = BahanBaku::orderBy('nama')->get();

        return Inertia::render('Stok/Pembelian', [
            'pembelians' => $pembelians,
            'pembelian' => $pembelians,
            'suppliers' => $suppliers,
            'bahanBakus' => $bahanBakus,
            'bahan_baku' => $bahanBakus,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'tanggal' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.bahan_baku_id' => 'required|exists:bahan_bakus,id',
            'items.*.jumlah' => 'required|numeric|min:0.01',
            'items.*.harga_satuan' => 'required|numeric|min:0',
            'items.*.subtotal' => 'nullable|numeric|min:0',
            'total_biaya' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $nomor = Pembelian::generateNomor();

            // Calculate total costs if not provided
            $calculatedTotal = 0;
            $itemsWithSubtotal = [];
            foreach ($validated['items'] as $item) {
                $subtotal = isset($item['subtotal']) && $item['subtotal'] > 0 
                    ? (float) $item['subtotal'] 
                    : (float) $item['jumlah'] * (float) $item['harga_satuan'];
                $calculatedTotal += $subtotal;
                $item['subtotal'] = $subtotal;
                $itemsWithSubtotal[] = $item;
            }

            $totalBiaya = !empty($validated['total_biaya']) && $validated['total_biaya'] > 0 
                ? (float) $validated['total_biaya'] 
                : $calculatedTotal;

            $pembelian = Pembelian::create([
                'nomor_pembelian' => $nomor,
                'supplier_id' => $validated['supplier_id'],
                'user_id' => auth()->id(),
                'tanggal' => $validated['tanggal'],
                'total_biaya' => $totalBiaya,
                'status_pembayaran' => 'lunas',
                'catatan' => $validated['catatan'] ?? null,
            ]);

            foreach ($itemsWithSubtotal as $item) {
                PembelianDetail::create([
                    'pembelian_id' => $pembelian->id,
                    'bahan_baku_id' => $item['bahan_baku_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $item['harga_satuan'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Increment Raw Material Stock
                $bahan = BahanBaku::find($item['bahan_baku_id']);
                if ($bahan) {
                    $stokSebelum = $bahan->stok;
                    $stokSesudah = $stokSebelum + $item['jumlah'];

                    $bahan->update([
                        'stok' => $stokSesudah,
                        'harga_beli_terakhir' => $item['harga_satuan'],
                    ]);

                    LogStok::create([
                        'bahan_baku_id' => $bahan->id,
                        'user_id' => auth()->id(),
                        'tipe' => 'masuk',
                        'jumlah' => $item['jumlah'],
                        'stok_sebelum' => $stokSebelum,
                        'stok_sesudah' => $stokSesudah,
                        'keterangan' => "Pembelian {$nomor}",
                        'referensi' => $nomor,
                    ]);
                }
            }
        });

        return redirect()->route('stok.pembelian')->with('success', 'Pembelian bahan baku berhasil dicatat & stok bertambah.');
    }
}
