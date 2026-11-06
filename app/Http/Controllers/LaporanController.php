<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\DetailPesanan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    public function harian(Request $request)
    {
        $startRaw = $request->tanggal_mulai ?: $request->start_date;
        $endRaw = $request->tanggal_selesai ?: $request->end_date;
        $startDate = $startRaw ? Carbon::parse($startRaw)->startOfDay() : Carbon::today()->startOfDay();
        $endDate = $endRaw ? Carbon::parse($endRaw)->endOfDay() : Carbon::today()->endOfDay();

        $query = Pesanan::whereBetween('created_at', [$startDate, $endDate])
            ->where('status_pembayaran', 'paid');

        $totalPenjualan = (float) (clone $query)->sum('total');
        $totalSubtotal = (float) (clone $query)->sum('subtotal');
        $totalDiskon = (float) (clone $query)->sum('diskon');
        $totalPajak = (float) (clone $query)->sum('pajak_nominal');
        $totalService = (float) (clone $query)->sum('service_nominal');
        $totalTransaksi = (clone $query)->count();

        // Breakdown by Payment Method
        $metodeBreakdown = (clone $query)
            ->select('metode_pembayaran', DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('metode_pembayaran')
            ->get();

        // Hourly breakdown
        $hourlyData = (clone $query)
            ->select(DB::raw('HOUR(created_at) as jam'), DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('HOUR(created_at)'))
            ->orderBy('jam')
            ->get();

        $estimatedHpp = round($totalPenjualan * 0.35); // 35% estimated COGS
        $labaKotor = max(0, $totalPenjualan - $estimatedHpp);
        $avgOrder = $totalTransaksi > 0 ? round($totalPenjualan / $totalTransaksi) : 0;
        $marginPersen = $totalPenjualan > 0 ? round(($labaKotor / $totalPenjualan) * 100, 1) : 0;

        $summaryData = [
            'total_penjualan' => $totalPenjualan,
            'total_subtotal' => $totalSubtotal,
            'total_diskon' => $totalDiskon,
            'total_pajak' => $totalPajak,
            'total_service' => $totalService,
            'total_transaksi' => $totalTransaksi,
            'total_hpp' => (float) $estimatedHpp,
            'laba_kotor' => (float) $labaKotor,
            'avg_order' => (float) $avgOrder,
            'margin_persen' => (float) $marginPersen,
        ];

        // Daily trend breakdown across selected date range
        $dailyData = (clone $query)
            ->select(
                DB::raw('DATE(created_at) as tgl'),
                DB::raw('SUM(total) as omset'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('tgl')
            ->get();

        $dailyTrend = $dailyData->map(function ($d) {
            $omset = (float) $d->omset;
            $hpp = round($omset * 0.35);
            $laba = max(0, $omset - $hpp);
            return [
                'tanggal' => Carbon::parse($d->tgl)->format('d M'),
                'full_date' => $d->tgl,
                'omset' => $omset,
                'hpp' => $hpp,
                'laba_kotor' => $laba,
                'transaksi' => (int) $d->count,
            ];
        });

        // Top categories breakdown
        $kategoriData = DetailPesanan::whereHas('pesanan', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate])
                  ->where('status_pembayaran', 'paid');
            })
            ->join('produks', 'detail_pesanans.produk_id', '=', 'produks.id')
            ->join('kategoris', 'produks.kategori_id', '=', 'kategoris.id')
            ->select('kategoris.nama as nama_kategori', DB::raw('SUM(detail_pesanans.subtotal) as total'), DB::raw('SUM(detail_pesanans.jumlah) as qty'))
            ->groupBy('kategoris.nama')
            ->orderByDesc('total')
            ->take(6)
            ->get();

        $kategoriBreakdown = $kategoriData->map(function ($k) use ($totalSubtotal) {
            $total = (float) $k->total;
            $persen = $totalSubtotal > 0 ? round(($total / $totalSubtotal) * 100, 1) : 0;
            return [
                'kategori' => $k->nama_kategori,
                'total' => $total,
                'qty' => (int) $k->qty,
                'persen' => $persen,
            ];
        });

        $formattedMetode = $metodeBreakdown->map(function ($m) use ($totalPenjualan) {
            $total = (float) $m->total;
            $persen = $totalPenjualan > 0 ? round(($total / $totalPenjualan) * 100, 1) : 0;
            return [
                'metode_bayar' => $m->metode_pembayaran ?: 'cash',
                'metode_pembayaran' => $m->metode_pembayaran ?: 'cash',
                'total' => $total,
                'count' => (int) $m->count,
                'persen' => $persen,
            ];
        });

        $formattedHourly = $hourlyData->map(function ($h) {
            return [
                'jam' => (int) $h->jam,
                'total' => (float) $h->total,
                'count' => (int) $h->count,
            ];
        });

        // 17. Perdetail laporan keuangan: Daftar transaksi terperinci
        $transaksiList = (clone $query)->with(['meja', 'user'])
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nomor_pesanan' => $p->nomor_pesanan,
                    'waktu' => $p->created_at ? $p->created_at->format('H:i') : '-',
                    'tanggal' => $p->created_at ? $p->created_at->format('d/m/Y') : '-',
                    'nama_pelanggan' => $p->nama_pelanggan ?: 'Walk-in Guest',
                    'meja' => $p->meja ? $p->meja->nomor_meja : '-',
                    'kasir' => $p->user ? $p->user->name : 'Kasir',
                    'metode_pembayaran' => $p->metode_pembayaran ?: 'cash',
                    'subtotal' => (float) $p->subtotal,
                    'diskon' => (float) $p->diskon,
                    'pajak' => (float) $p->pajak_nominal,
                    'service' => (float) $p->service_nominal,
                    'total' => (float) $p->total,
                    'status' => $p->status_pembayaran,
                ];
            });

        return Inertia::render('Laporan/Harian', [
            'ringkasan' => $summaryData,
            'summary' => $summaryData,
            'daily_trend' => $dailyTrend,
            'kategori_breakdown' => $kategoriBreakdown,
            'metodeBreakdown' => $formattedMetode,
            'metode_breakdown' => $formattedMetode,
            'hourlyData' => $formattedHourly,
            'hourly_sales' => $formattedHourly,
            'transaksi_list' => $transaksiList,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'tanggal_mulai' => $startDate->format('Y-m-d'),
                'tanggal_selesai' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    public function exportExcel(Request $request)
    {
        $startRaw = $request->tanggal_mulai ?: $request->start_date;
        $endRaw = $request->tanggal_selesai ?: $request->end_date;
        $startDate = $startRaw ? Carbon::parse($startRaw)->startOfDay() : Carbon::today()->startOfDay();
        $endDate = $endRaw ? Carbon::parse($endRaw)->endOfDay() : Carbon::today()->endOfDay();

        $pesanans = Pesanan::with(['meja', 'user'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status_pembayaran', 'paid')
            ->orderBy('created_at')
            ->get();

        $fileName = 'Laporan_Keuangan_JelangHari_' . $startDate->format('Ymd') . '_' . $endDate->format('Ymd') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($pesanans, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');
            // Write BOM for UTF-8 Excel support
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['JELANG HARI COFFEE & WORKSPACE']);
            fputcsv($handle, ['LAPORAN PENJUALAN & KEUANGAN RESMI']);
            fputcsv($handle, ['Periode', $startDate->format('d/m/Y') . ' s/d ' . $endDate->format('d/m/Y')]);
            fputcsv($handle, ['Waktu Cetak', now()->format('d/m/Y H:i:s')]);
            fputcsv($handle, []);

            $totalOmset = $pesanans->sum('total');
            $totalDiskon = $pesanans->sum('diskon');
            $estimasiHpp = round($totalOmset * 0.35);
            $labaKotor = max(0, $totalOmset - $estimasiHpp);

            fputcsv($handle, ['RINGKASAN EKSEKUTIF']);
            fputcsv($handle, ['Total Transaksi Berhasil', $pesanans->count() . ' Struk']);
            fputcsv($handle, ['Total Omset Penjualan', 'Rp ' . number_format($totalOmset, 0, ',', '.')]);
            fputcsv($handle, ['Total Potongan Diskon', 'Rp ' . number_format($totalDiskon, 0, ',', '.')]);
            fputcsv($handle, ['Estimasi HPP (35%)', 'Rp ' . number_format($estimasiHpp, 0, ',', '.')]);
            fputcsv($handle, ['Estimasi Laba Kotor', 'Rp ' . number_format($labaKotor, 0, ',', '.')]);
            fputcsv($handle, []);

            fputcsv($handle, [
                'No.',
                'No. Struk',
                'Tanggal',
                'Jam',
                'Nama Pelanggan',
                'Meja',
                'Kasir',
                'Metode Bayar',
                'Subtotal (Rp)',
                'Diskon (Rp)',
                'Pajak (Rp)',
                'Service (Rp)',
                'Total (Rp)',
                'Status'
            ]);

            $no = 1;
            foreach ($pesanans as $p) {
                fputcsv($handle, [
                    $no++,
                    $p->nomor_pesanan,
                    $p->created_at->format('d/m/Y'),
                    $p->created_at->format('H:i'),
                    $p->nama_pelanggan ?: 'Walk-in Guest',
                    $p->meja ? $p->meja->nomor_meja : '-',
                    $p->user ? $p->user->name : 'Kasir',
                    strtoupper($p->metode_pembayaran ?: 'CASH'),
                    (float) $p->subtotal,
                    (float) $p->diskon,
                    (float) $p->pajak_nominal,
                    (float) $p->service_nominal,
                    (float) $p->total,
                    'LUNAS'
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $startRaw = $request->tanggal_mulai ?: $request->start_date;
        $endRaw = $request->tanggal_selesai ?: $request->end_date;
        $startDate = $startRaw ? Carbon::parse($startRaw)->startOfDay() : Carbon::today()->startOfDay();
        $endDate = $endRaw ? Carbon::parse($endRaw)->endOfDay() : Carbon::today()->endOfDay();

        $pesanans = Pesanan::with(['meja', 'user'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status_pembayaran', 'paid')
            ->orderBy('created_at')
            ->get();

        $totalPenjualan = (float) $pesanans->sum('total');
        $estimatedHpp = round($totalPenjualan * 0.35);
        $labaKotor = max(0, $totalPenjualan - $estimatedHpp);

        $metodeBreakdown = Pesanan::whereBetween('created_at', [$startDate, $endDate])
            ->where('status_pembayaran', 'paid')
            ->select('metode_pembayaran', DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('metode_pembayaran')
            ->get();

        return view('laporan_pdf', [
            'pesanans' => $pesanans,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'metodeBreakdown' => $metodeBreakdown,
            'summary' => [
                'total_penjualan' => $totalPenjualan,
                'total_transaksi' => $pesanans->count(),
                'total_hpp' => (float) $estimatedHpp,
                'laba_kotor' => (float) $labaKotor,
            ]
        ]);
    }

    public function produk(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : Carbon::today()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::today()->endOfDay();

        $laporanProduk = DB::table('detail_pesanans')
            ->join('pesanans', 'detail_pesanans.pesanan_id', '=', 'pesanans.id')
            ->join('produks', 'detail_pesanans.produk_id', '=', 'produks.id')
            ->join('kategoris', 'produks.kategori_id', '=', 'kategoris.id')
            ->whereBetween('pesanans.created_at', [$startDate, $endDate])
            ->where('pesanans.status_pembayaran', 'paid')
            ->select(
                'produks.nama as nama_produk',
                'kategoris.nama as nama_kategori',
                'produks.harga as harga_jual',
                'produks.harga_modal',
                DB::raw('SUM(detail_pesanans.jumlah) as total_terjual'),
                DB::raw('SUM(detail_pesanans.subtotal) as total_omset'),
                DB::raw('SUM(detail_pesanans.jumlah * produks.harga_modal) as total_modal'),
                DB::raw('SUM(detail_pesanans.subtotal - (detail_pesanans.jumlah * produks.harga_modal)) as total_profit')
            )
            ->groupBy('produks.id', 'produks.nama', 'kategoris.nama', 'produks.harga', 'produks.harga_modal')
            ->orderByDesc('total_terjual')
            ->get();

        $formattedProduk = $laporanProduk->map(function ($item) {
            return [
                'nama_produk' => $item->nama_produk,
                'nama_kategori' => $item->nama_kategori,
                'total_qty' => (int) $item->total_terjual,
                'total_terjual' => (int) $item->total_terjual,
                'total_omset' => (float) $item->total_omset,
                'total_hpp' => (float) $item->total_modal,
                'total_modal' => (float) $item->total_modal,
                'total_margin' => (float) $item->total_profit,
                'total_profit' => (float) $item->total_profit,
            ];
        });

        return Inertia::render('Laporan/Produk', [
            'laporanProduk' => $laporanProduk,
            'produk_terlaris' => $formattedProduk,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'tanggal_mulai' => $startDate->format('Y-m-d'),
                'tanggal_selesai' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
