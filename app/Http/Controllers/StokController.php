<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use App\Models\Produk;
use App\Models\ProdukBahan;
use App\Models\LogStok;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StokController extends Controller
{
    public function bahanBaku(Request $request)
    {
        $bahan = BahanBaku::when($request->search, function ($q, $search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%");
            })
            ->when($request->kategori, function ($q, $kat) {
                $q->where('kategori', $kat);
            })
            ->orderBy('nama')
            ->paginate(15)
            ->withQueryString();

        $logs = LogStok::with(['bahanBaku', 'produk', 'user'])->latest()->take(20)->get();
        $suppliers = Supplier::orderBy('nama')->get();

        return Inertia::render('Stok/BahanBaku', [
            'bahanBakus' => $bahan,
            'bahan_baku' => $bahan,
            'suppliers' => $suppliers,
            'recentLogs' => $logs,
            'filters' => $request->only(['search', 'kategori']),
        ]);
    }

    public function storeBahanBaku(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:bahan_bakus,kode',
            'nama' => 'required|string|max:100',
            'kategori' => 'required|string',
            'satuan' => 'required|string',
            'stok' => 'required|numeric|min:0',
            'min_stok' => 'required|numeric|min:0',
            'harga_beli_terakhir' => 'nullable|numeric|min:0',
        ]);

        $validated['kode'] = strtoupper($validated['kode']);
        $bahan = BahanBaku::create($validated);

        LogStok::create([
            'bahan_baku_id' => $bahan->id,
            'user_id' => auth()->id(),
            'tipe' => 'masuk',
            'jumlah' => $bahan->stok,
            'stok_sebelum' => 0,
            'stok_sesudah' => $bahan->stok,
            'keterangan' => 'Saldo awal bahan baku',
        ]);

        return redirect()->route('stok.bahan-baku')->with('success', 'Bahan baku berhasil ditambahkan.');
    }

    public function updateBahanBaku(Request $request, BahanBaku $bahanBaku)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:bahan_bakus,kode,' . $bahanBaku->id,
            'nama' => 'required|string|max:100',
            'kategori' => 'required|string',
            'satuan' => 'required|string',
            'min_stok' => 'required|numeric|min:0',
            'harga_beli_terakhir' => 'nullable|numeric|min:0',
        ]);

        $validated['kode'] = strtoupper($validated['kode']);
        $bahanBaku->update($validated);

        return redirect()->route('stok.bahan-baku')->with('success', 'Bahan baku berhasil diperbarui.');
    }

    public function destroyBahanBaku(BahanBaku $bahanBaku)
    {
        if ($bahanBaku->resepProduks()->exists()) {
            return back()->with('error', "Bahan baku '{$bahanBaku->nama}' tidak dapat dihapus karena masih digunakan dalam resep menu.");
        }

        $bahanBaku->logs()->delete();
        $bahanBaku->delete();

        return redirect()->route('stok.bahan-baku')->with('success', 'Bahan baku berhasil dihapus.');
    }

    public function penyesuaian(Request $request, BahanBaku $bahanBaku)
    {
        $request->validate([
            'stok_fisik' => 'required|numeric|min:0',
            'alasan' => 'required|string',
        ]);

        $selisih = $request->stok_fisik - $bahanBaku->stok;
        $tipe = $selisih >= 0 ? 'masuk' : 'penyesuaian';

        LogStok::create([
            'bahan_baku_id' => $bahanBaku->id,
            'user_id' => auth()->id(),
            'tipe' => $tipe,
            'jumlah' => abs($selisih),
            'stok_sebelum' => $bahanBaku->stok,
            'stok_sesudah' => $request->stok_fisik,
            'keterangan' => "Stock Opname: {$request->alasan}",
        ]);

        $bahanBaku->update(['stok' => $request->stok_fisik]);

        return redirect()->route('stok.bahan-baku')->with('success', 'Penyesuaian stok opname berhasil disimpan.');
    }

    public function resep()
    {
        $produks = Produk::with(['kategori', 'resep.bahanBaku'])->orderBy('nama')->get();
        $bahanBakus = BahanBaku::orderBy('nama')->get();

        return Inertia::render('Stok/Resep', [
            'produks' => $produks,
            'produk' => $produks,
            'bahanBakus' => $bahanBakus,
            'bahan_baku' => $bahanBakus,
        ]);
    }

    public function updateResep(Request $request, Produk $produk)
    {
        $rawResep = is_array($request->resep) ? $request->resep : [];
        $validResep = [];
        foreach ($rawResep as $item) {
            if (!empty($item['bahan_baku_id']) && isset($item['jumlah_pemakaian']) && (float)$item['jumlah_pemakaian'] > 0) {
                if (BahanBaku::where('id', $item['bahan_baku_id'])->exists()) {
                    $validResep[] = [
                        'bahan_baku_id' => (int) $item['bahan_baku_id'],
                        'jumlah_pemakaian' => (float) $item['jumlah_pemakaian'],
                    ];
                }
            }
        }

        DB::transaction(function () use ($validResep, $produk) {
            $produk->resep()->delete();
            foreach ($validResep as $item) {
                ProdukBahan::create([
                    'produk_id' => $produk->id,
                    'bahan_baku_id' => $item['bahan_baku_id'],
                    'jumlah_pemakaian' => $item['jumlah_pemakaian'],
                ]);
            }
        });

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Resep untuk {$produk->nama} berhasil disimpan.",
            ]);
        }

        return redirect()->route('stok.resep')->with('success', "Resep untuk {$produk->nama} berhasil disimpan.");
    }
}
