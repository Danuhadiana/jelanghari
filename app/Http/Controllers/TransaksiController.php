<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\AuditLog;
use App\Services\StockService;
use App\Services\PrinterService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransaksiController extends Controller
{
    public function index(Request $request)
    {
        $query = Pesanan::with(['meja', 'user'])
            ->when($request->search, function ($q, $search) {
                $q->where('nomor_pesanan', 'like', "%{$search}%")
                  ->orWhere('nama_pelanggan', 'like', "%{$search}%");
            })
            ->when($request->tanggal, function ($q, $tgl) {
                $q->whereDate('created_at', $tgl);
            })
            ->when($request->metode, function ($q, $metode) {
                $q->where('metode_pembayaran', $metode);
            })
            ->when($request->status, function ($q, $status) {
                $q->where('status_pesanan', $status);
            })
            ->latest();

        $transaksi = $query->paginate(15)->withQueryString();

        return Inertia::render('Transaksi/Index', [
            'transaksi' => $transaksi,
            'filters' => $request->only(['search', 'tanggal', 'metode', 'status']),
        ]);
    }

    public function show(Pesanan $pesanan)
    {
        $pesanan->load(['details.modifiers', 'meja', 'user']);

        return Inertia::render('Transaksi/Detail', [
            'pesanan' => $pesanan,
        ]);
    }

    public function voidOrder(Request $request, Pesanan $pesanan, StockService $stockService)
    {
        if ($pesanan->status_pesanan === 'dibatalkan') {
            return back()->with('error', 'Pesanan sudah dibatalkan sebelumnya.');
        }

        $alasan = $request->input('alasan', 'Pembatalan transaksi oleh kasir/manager');

        // Restore Stock
        $stockService->kembalikanStokPesanan($pesanan);

        $pesanan->update([
            'status_pesanan' => 'dibatalkan',
            'status_pembayaran' => 'refunded',
            'catatan' => $pesanan->catatan ? $pesanan->catatan . " [VOID: {$alasan}]" : "[VOID: {$alasan}]",
        ]);

        if ($pesanan->meja_id) {
            $pesanan->meja->update(['status' => 'kosong']);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'aksi' => 'VOID_TRANSAKSI',
            'model' => 'Pesanan',
            'model_id' => $pesanan->id,
            'data_sebelum' => ['status' => 'selesai', 'total' => $pesanan->total],
            'data_sesudah' => ['status' => 'dibatalkan', 'alasan' => $alasan],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('transaksi.index')->with('success', "Pesanan #{$pesanan->nomor_pesanan} berhasil dibatalkan (VOID).");
    }

    public function print(Pesanan $pesanan, PrinterService $printerService)
    {
        $pesanan->load(['details.modifiers', 'meja', 'user']);
        $rawEscPos = $printerService->formatStrukKasir($pesanan);

        return response()->json([
            'success' => true,
            'raw_base64' => base64_encode($rawEscPos),
            'pesanan' => $pesanan,
        ]);
    }
}
