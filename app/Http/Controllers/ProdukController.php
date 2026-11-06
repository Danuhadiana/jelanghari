<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Kategori;
use App\Models\ModifierGroup;
use App\Models\BahanBaku;
use App\Models\Varian;
use App\Models\ProdukBahan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $query = Produk::with(['kategori', 'varians'])
            ->when($request->search, function ($q, $search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%");
            })
            ->when($request->type, function ($q, $type) {
                if ($type === 'minuman') {
                    $q->where(function ($sub) {
                        $sub->whereHas('kategori', fn($kq) => $kq->whereIn('slug', ['signature', 'coffee-based', 'manual-brew', 'non-coffee', 'tropical']))
                            ->orWhere('station', 'barista');
                    });
                } elseif ($type === 'makanan') {
                    $q->where(function ($sub) {
                        $sub->whereHas('kategori', fn($kq) => $kq->whereIn('slug', ['traditional', 'noodles', 'western']))
                            ->orWhere(function ($s) {
                                $s->where('station', 'kitchen')
                                  ->whereDoesntHave('kategori', fn($kq) => $kq->whereIn('slug', ['snacks', 'pastry-dessert']));
                            });
                    });
                } elseif ($type === 'snack') {
                    $q->whereHas('kategori', fn($kq) => $kq->whereIn('slug', ['snacks', 'pastry-dessert']));
                }
            })
            ->when($request->kategori, function ($q, $kat) {
                if (is_numeric($kat)) {
                    $q->where('kategori_id', $kat);
                } else {
                    $q->whereHas('kategori', fn($kq) => $kq->where('slug', $kat));
                }
            })
            ->orderBy('urutan');

        $produks = $query->paginate(12)->withQueryString();
        $produks->getCollection()->transform(function ($item) {
            $item->gambar = $item->foto;
            $item->is_active = (bool) $item->is_tersedia;
            $item->is_favorit = (bool) $item->is_favorite;
            $item->hpp = (float) $item->harga_modal;
            $item->varian = $item->varians;
            return $item;
        });

        $kategoris = Kategori::where('is_aktif', true)->orderBy('urutan')->get();

        return Inertia::render('Produk/Index', [
            'produks' => $produks,
            'produk' => $produks,
            'kategoris' => $kategoris,
            'kategori' => $kategoris,
            'filters' => $request->only(['search', 'kategori', 'type']),
        ]);
    }

    public function create()
    {
        $kategoris = Kategori::where('is_aktif', true)->orderBy('urutan')->get();
        return Inertia::render('Produk/Form', [
            'kategoris' => $kategoris,
            'kategori' => $kategoris,
            'modifierGroups' => ModifierGroup::with('modifiers')->get(),
            'bahanBakus' => BahanBaku::all(),
            'produk' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_id' => 'required|exists:kategoris,id',
            'kode' => 'nullable|string|max:50',
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'harga_modal' => 'nullable|numeric|min:0',
            'hpp' => 'nullable|numeric|min:0',
            'foto' => 'nullable|image|max:3072',
            'gambar' => 'nullable|image|max:3072',
            'is_tersedia' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'is_favorite' => 'nullable|boolean',
            'is_favorit' => 'nullable|boolean',
            'kelola_stok' => 'nullable|boolean',
            'stok' => 'nullable|integer|min:0',
            'min_stok' => 'nullable|integer|min:0',
            'station' => 'nullable|in:barista,kitchen',
            'urutan' => 'nullable|integer',
            'varians' => 'nullable|array',
            'varian' => 'nullable|array',
            'modifier_groups' => 'nullable|array',
            'modifier' => 'nullable|array',
            'resep' => 'nullable|array',
        ]);

        DB::transaction(function () use ($request, $validated) {
            $fotoPath = null;
            if ($request->hasFile('foto')) {
                $path = $request->file('foto')->store('produk', 'public');
                $fotoPath = "/storage/{$path}";
            } elseif ($request->hasFile('gambar')) {
                $path = $request->file('gambar')->store('produk', 'public');
                $fotoPath = "/storage/{$path}";
            }

            // Generate unique kode if missing
            $kode = !empty($validated['kode']) 
                ? strtoupper($validated['kode']) 
                : 'PRD-' . strtoupper(Str::random(5));

            $isTersedia = $request->has('is_tersedia') 
                ? (bool) $request->is_tersedia 
                : ($request->has('is_active') ? (bool) $request->is_active : true);

            $isFavorite = $request->has('is_favorite') 
                ? (bool) $request->is_favorite 
                : ($request->has('is_favorit') ? (bool) $request->is_favorit : false);

            $hpp = $validated['harga_modal'] ?? $validated['hpp'] ?? 0;
            $station = $validated['station'] ?? 'barista';

            $produk = Produk::create([
                'kategori_id' => $validated['kategori_id'],
                'kode' => $kode,
                'nama' => $validated['nama'],
                'slug' => Str::slug($validated['nama']),
                'deskripsi' => $validated['deskripsi'] ?? null,
                'harga' => $validated['harga'],
                'harga_modal' => $hpp,
                'foto' => $fotoPath,
                'is_tersedia' => $isTersedia,
                'is_favorite' => $isFavorite,
                'kelola_stok' => $validated['kelola_stok'] ?? false,
                'stok' => $validated['stok'] ?? 0,
                'min_stok' => $validated['min_stok'] ?? 5,
                'station' => $station,
                'urutan' => $validated['urutan'] ?? 0,
            ]);

            // Varians
            $rawVarians = $validated['varians'] ?? $validated['varian'] ?? [];
            if (!empty($rawVarians)) {
                foreach ($rawVarians as $var) {
                    if (!empty($var['nama'])) {
                        Varian::create([
                            'produk_id' => $produk->id,
                            'nama' => $var['nama'],
                            'harga_tambahan' => $var['harga_tambahan'] ?? 0,
                            'is_default' => $var['is_default'] ?? false,
                        ]);
                    }
                }
            }

            // Modifier Groups
            if (!empty($validated['modifier_groups'])) {
                $produk->modifierGroups()->sync($validated['modifier_groups']);
            }

            // Resep
            if (!empty($validated['resep'])) {
                foreach ($validated['resep'] as $rsp) {
                    if (!empty($rsp['bahan_baku_id']) && !empty($rsp['jumlah_pemakaian'])) {
                        ProdukBahan::create([
                            'produk_id' => $produk->id,
                            'bahan_baku_id' => $rsp['bahan_baku_id'],
                            'jumlah_pemakaian' => $rsp['jumlah_pemakaian'],
                        ]);
                    }
                }
            }
        });

        return redirect()->route('produk.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Produk $produk)
    {
        $produk->load(['varians', 'modifierGroups', 'resep.bahanBaku']);
        $kategoris = Kategori::where('is_aktif', true)->orderBy('urutan')->get();

        // Format to match both conventions
        $produkData = $produk->toArray();
        $produkData['is_active'] = (bool) $produk->is_tersedia;
        $produkData['is_favorit'] = (bool) $produk->is_favorite;
        $produkData['hpp'] = (float) $produk->harga_modal;
        $produkData['varian'] = $produk->varians->map(fn($v) => [
            'id' => $v->id,
            'nama' => $v->nama,
            'harga_tambahan' => (float) $v->harga_tambahan,
            'is_default' => (bool) $v->is_default,
        ])->toArray();

        return Inertia::render('Produk/Form', [
            'kategoris' => $kategoris,
            'kategori' => $kategoris,
            'modifierGroups' => ModifierGroup::with('modifiers')->get(),
            'bahanBakus' => BahanBaku::all(),
            'produk' => $produkData,
        ]);
    }

    public function update(Request $request, Produk $produk)
    {
        $validated = $request->validate([
            'kategori_id' => 'required|exists:kategoris,id',
            'kode' => 'nullable|string|max:50',
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'harga_modal' => 'nullable|numeric|min:0',
            'hpp' => 'nullable|numeric|min:0',
            'foto' => 'nullable',
            'gambar' => 'nullable',
            'is_tersedia' => 'nullable',
            'is_active' => 'nullable',
            'is_favorite' => 'nullable',
            'is_favorit' => 'nullable',
            'kelola_stok' => 'nullable|boolean',
            'stok' => 'nullable|integer|min:0',
            'min_stok' => 'nullable|integer|min:0',
            'station' => 'nullable|in:barista,kitchen',
            'urutan' => 'nullable|integer',
            'varians' => 'nullable|array',
            'varian' => 'nullable|array',
            'modifier_groups' => 'nullable|array',
            'modifier' => 'nullable|array',
            'resep' => 'nullable|array',
        ]);

        DB::transaction(function () use ($request, $produk, $validated) {
            $fotoPath = $produk->foto;
            if ($request->hasFile('foto')) {
                $path = $request->file('foto')->store('produk', 'public');
                $fotoPath = "/storage/{$path}";
            } elseif ($request->hasFile('gambar')) {
                $path = $request->file('gambar')->store('produk', 'public');
                $fotoPath = "/storage/{$path}";
            }

            $kode = !empty($validated['kode']) 
                ? strtoupper($validated['kode']) 
                : ($produk->kode ?: 'PRD-' . strtoupper(Str::random(5)));

            $isTersedia = $request->has('is_tersedia') 
                ? (bool) $request->is_tersedia 
                : ($request->has('is_active') ? (bool) $request->is_active : $produk->is_tersedia);

            $isFavorite = $request->has('is_favorite') 
                ? (bool) $request->is_favorite 
                : ($request->has('is_favorit') ? (bool) $request->is_favorit : $produk->is_favorite);

            $hpp = $validated['harga_modal'] ?? $validated['hpp'] ?? $produk->harga_modal;
            $station = $validated['station'] ?? $produk->station ?? 'barista';

            $produk->update([
                'kategori_id' => $validated['kategori_id'],
                'kode' => $kode,
                'nama' => $validated['nama'],
                'slug' => Str::slug($validated['nama']),
                'deskripsi' => $validated['deskripsi'] ?? null,
                'harga' => $validated['harga'],
                'harga_modal' => $hpp,
                'foto' => $fotoPath,
                'is_tersedia' => $isTersedia,
                'is_favorite' => $isFavorite,
                'kelola_stok' => $validated['kelola_stok'] ?? $produk->kelola_stok,
                'stok' => $validated['stok'] ?? $produk->stok,
                'min_stok' => $validated['min_stok'] ?? $produk->min_stok,
                'station' => $station,
                'urutan' => $validated['urutan'] ?? $produk->urutan ?? 0,
            ]);

            // Sync Varians
            $rawVarians = $validated['varians'] ?? $validated['varian'] ?? [];
            $produk->varians()->delete();
            if (!empty($rawVarians)) {
                foreach ($rawVarians as $var) {
                    if (!empty($var['nama'])) {
                        Varian::create([
                            'produk_id' => $produk->id,
                            'nama' => $var['nama'],
                            'harga_tambahan' => $var['harga_tambahan'] ?? 0,
                            'is_default' => $var['is_default'] ?? false,
                        ]);
                    }
                }
            }

            // Sync Modifier Groups
            if (isset($validated['modifier_groups'])) {
                $produk->modifierGroups()->sync($validated['modifier_groups']);
            }

            // Sync Resep
            if (isset($validated['resep'])) {
                $produk->resep()->delete();
                foreach ($validated['resep'] as $rsp) {
                    if (!empty($rsp['bahan_baku_id']) && !empty($rsp['jumlah_pemakaian'])) {
                        ProdukBahan::create([
                            'produk_id' => $produk->id,
                            'bahan_baku_id' => $rsp['bahan_baku_id'],
                            'jumlah_pemakaian' => $rsp['jumlah_pemakaian'],
                        ]);
                    }
                }
            }
        });

        return redirect()->route('produk.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Produk $produk)
    {
        $produk->delete();
        return redirect()->route('produk.index')->with('success', 'Produk berhasil dihapus.');
    }

    public function toggleTersedia(Produk $produk)
    {
        $produk->update(['is_tersedia' => !$produk->is_tersedia]);
        return back();
    }
}
