<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class KategoriController extends Controller
{
    public function index(Request $request)
    {
        $kategoris = Kategori::withCount('produks')
            ->when($request->search, function ($q, $search) {
                $q->where('nama', 'like', "%{$search}%");
            })
            ->orderBy('urutan')
            ->get();

        return Inertia::render('Kategori/Index', [
            'kategoris' => $kategoris,
            'kategori' => $kategoris,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:50',
            'ikon' => 'nullable|string|max:50',
            'urutan' => 'nullable|integer',
            'is_aktif' => 'boolean',
        ]);

        Kategori::create([
            'nama' => $validated['nama'],
            'slug' => Str::slug($validated['nama']),
            'ikon' => $validated['ikon'] ?? null,
            'urutan' => $validated['urutan'] ?? 0,
            'is_aktif' => $validated['is_aktif'] ?? true,
        ]);

        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Kategori $kategori)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:50',
            'ikon' => 'nullable|string|max:50',
            'urutan' => 'nullable|integer',
            'is_aktif' => 'boolean',
        ]);

        $kategori->update([
            'nama' => $validated['nama'],
            'slug' => Str::slug($validated['nama']),
            'ikon' => $validated['ikon'] ?? null,
            'urutan' => $validated['urutan'] ?? 0,
            'is_aktif' => $validated['is_aktif'] ?? true,
        ]);

        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Kategori $kategori)
    {
        $kategori->delete();
        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil dihapus.');
    }

    public function toggle(Kategori $kategori)
    {
        $kategori->update(['is_aktif' => !$kategori->is_aktif]);
        return back();
    }
}
