<?php

namespace App\Http\Controllers;

use App\Models\ShiftKasir;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = ShiftKasir::with('user')->latest()->paginate(15);
        $activeShift = ShiftKasir::where('user_id', auth()->id())
            ->where('status', 'aktif')
            ->latest()
            ->first();

        $sales = (float) ($activeShift ? ($activeShift->total_penjualan_cash + $activeShift->total_penjualan_non_cash) : 0);
        $count = (int) ($activeShift ? \App\Models\Pesanan::where('created_at', '>=', $activeShift->waktu_buka)->count() : 0);

        return Inertia::render('Shift/Index', [
            'shifts' => $shifts,
            'activeShift' => $activeShift,
            'active_shift' => $activeShift,
            'active_shift_stats' => [
                'sales' => $sales,
                'count' => $count,
            ],
        ]);
    }

    public function bukaShift(Request $request)
    {
        $request->validate([
            'modal_awal' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $existing = ShiftKasir::where('user_id', auth()->id())->where('status', 'aktif')->first();
        if ($existing) {
            return back()->with('error', 'Anda masih memiliki shift aktif yang belum ditutup.');
        }

        ShiftKasir::create([
            'user_id' => auth()->id(),
            'waktu_buka' => now(),
            'modal_awal' => $request->modal_awal,
            'total_penjualan_cash' => 0,
            'total_penjualan_non_cash' => 0,
            'total_refund' => 0,
            'kas_diharapkan' => $request->modal_awal,
            'status' => 'aktif',
            'catatan' => $request->catatan,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Shift kasir berhasil dibuka.']);
        }

        if ($request->input('redirect_to') === 'kasir' || str_contains($request->headers->get('referer', ''), 'kasir')) {
            return back()->with('success', 'Shift kasir berhasil dibuka.');
        }

        return redirect()->route('shift.index')->with('success', 'Shift kasir berhasil dibuka.');
    }

    public function tutupShift(Request $request, ShiftKasir $shift)
    {
        $request->validate([
            'kas_aktual' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $selisih = $request->kas_aktual - $shift->kas_diharapkan;

        $shift->update([
            'waktu_tutup' => now(),
            'kas_aktual' => $request->kas_aktual,
            'selisih' => $selisih,
            'status' => 'tutup',
            'catatan' => $request->catatan ? ($shift->catatan ? $shift->catatan . " | " . $request->catatan : $request->catatan) : $shift->catatan,
        ]);

        $msg = 'Shift kasir berhasil ditutup. Selisih kas: ' . number_format($selisih, 0, ',', '.');

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => $msg, 'selisih' => $selisih]);
        }

        if ($request->input('redirect_to') === 'kasir' || str_contains($request->headers->get('referer', ''), 'kasir')) {
            return back()->with('success', $msg);
        }

        return redirect()->route('shift.index')->with('success', $msg);
    }
}
