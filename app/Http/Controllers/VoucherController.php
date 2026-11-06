<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $vouchers = Voucher::when($request->search, function ($q, $search) {
                $q->where('kode', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Voucher/Index', [
            'vouchers' => $vouchers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:vouchers,kode',
            'nama' => 'required|string|max:100',
            'tipe' => 'required|in:persen,nominal',
            'nilai' => 'required|numeric|min:0',
            'min_belanja' => 'nullable|numeric|min:0',
            'maks_potongan' => 'nullable|numeric|min:0',
            'kuota' => 'required|integer|min:1',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'is_aktif' => 'boolean',
        ]);

        $validated['kode'] = strtoupper($validated['kode']);
        Voucher::create($validated);

        return redirect()->route('voucher.index')->with('success', 'Voucher berhasil dibuat.');
    }

    public function update(Request $request, Voucher $voucher)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:vouchers,kode,' . $voucher->id,
            'nama' => 'required|string|max:100',
            'tipe' => 'required|in:persen,nominal',
            'nilai' => 'required|numeric|min:0',
            'min_belanja' => 'nullable|numeric|min:0',
            'maks_potongan' => 'nullable|numeric|min:0',
            'kuota' => 'required|integer|min:1',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'is_aktif' => 'boolean',
        ]);

        $validated['kode'] = strtoupper($validated['kode']);
        $voucher->update($validated);

        return redirect()->route('voucher.index')->with('success', 'Voucher berhasil diperbarui.');
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();
        return redirect()->route('voucher.index')->with('success', 'Voucher berhasil dihapus.');
    }

    public function toggle(Voucher $voucher)
    {
        $voucher->update(['is_aktif' => !$voucher->is_aktif]);
        return back();
    }
}
