<?php

namespace App\Services;

use App\Models\Pesanan;
use App\Models\BahanBaku;
use App\Models\Produk;
use App\Models\LogStok;
use App\Models\Notifikasi;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Deduct stock for an order based on recipes (bahan baku) and direct product stocks
     */
    public function potongStokPesanan(Pesanan $pesanan): void
    {
        DB::transaction(function () use ($pesanan) {
            foreach ($pesanan->details as $item) {
                $produk = Produk::with('resep.bahanBaku')->find($item->produk_id);
                if (!$produk) continue;

                // 1. Direct product stock reduction (if managed directly)
                if ($produk->kelola_stok) {
                    $stokSebelum = $produk->stok;
                    $stokSesudah = $stokSebelum - $item->jumlah;
                    $produk->update(['stok' => $stokSesudah]);

                    LogStok::create([
                        'produk_id' => $produk->id,
                        'user_id' => $pesanan->user_id,
                        'tipe' => 'penjualan',
                        'jumlah' => $item->jumlah,
                        'stok_sebelum' => $stokSebelum,
                        'stok_sesudah' => $stokSesudah,
                        'keterangan' => "Penjualan pesanan #{$pesanan->nomor_pesanan}",
                        'referensi' => $pesanan->nomor_pesanan,
                    ]);

                    if ($stokSesudah <= $produk->min_stok) {
                        Notifikasi::create([
                            'judul' => 'Stok Produk Menipis',
                            'pesan' => "Stok produk {$produk->nama} tersisa {$stokSesudah} (Min: {$produk->min_stok})",
                            'tipe' => 'warning',
                            'link' => '/produk',
                        ]);
                    }
                }

                // 2. Recipe ingredients reduction (Bahan Baku)
                if ($produk->resep && $produk->resep->isNotEmpty()) {
                    foreach ($produk->resep as $resep) {
                        $bahan = $resep->bahanBaku;
                        if (!$bahan) continue;

                        $pemakaianTotal = $resep->jumlah_pemakaian * $item->jumlah;
                        $stokSebelumBahan = $bahan->stok;
                        $stokSesudahBahan = $stokSebelumBahan - $pemakaianTotal;

                        $bahan->update(['stok' => $stokSesudahBahan]);

                        LogStok::create([
                            'bahan_baku_id' => $bahan->id,
                            'user_id' => $pesanan->user_id,
                            'tipe' => 'keluar',
                            'jumlah' => $pemakaianTotal,
                            'stok_sebelum' => $stokSebelumBahan,
                            'stok_sesudah' => $stokSesudahBahan,
                            'keterangan' => "Resep {$produk->nama} ({$item->jumlah}x) - Pesanan #{$pesanan->nomor_pesanan}",
                            'referensi' => $pesanan->nomor_pesanan,
                        ]);

                        if ($stokSesudahBahan <= $bahan->min_stok) {
                            Notifikasi::create([
                                'judul' => 'Stok Bahan Baku Menipis',
                                'pesan' => "Bahan {$bahan->nama} tersisa {$stokSesudahBahan} {$bahan->satuan} (Min: {$bahan->min_stok} {$bahan->satuan})",
                                'tipe' => 'warning',
                                'link' => '/stok/bahan-baku',
                            ]);
                        }
                    }
                }
            }
        });
    }

    /**
     * Restore stock if order is cancelled or refunded
     */
    public function kembalikanStokPesanan(Pesanan $pesanan): void
    {
        DB::transaction(function () use ($pesanan) {
            foreach ($pesanan->details as $item) {
                $produk = Produk::with('resep.bahanBaku')->find($item->produk_id);
                if (!$produk) continue;

                if ($produk->kelola_stok) {
                    $stokSebelum = $produk->stok;
                    $stokSesudah = $stokSebelum + $item->jumlah;
                    $produk->update(['stok' => $stokSesudah]);

                    LogStok::create([
                        'produk_id' => $produk->id,
                        'user_id' => auth()->id(),
                        'tipe' => 'penyesuaian',
                        'jumlah' => $item->jumlah,
                        'stok_sebelum' => $stokSebelum,
                        'stok_sesudah' => $stokSesudah,
                        'keterangan' => "Pengembalian/Batal pesanan #{$pesanan->nomor_pesanan}",
                        'referensi' => $pesanan->nomor_pesanan,
                    ]);
                }

                if ($produk->resep && $produk->resep->isNotEmpty()) {
                    foreach ($produk->resep as $resep) {
                        $bahan = $resep->bahanBaku;
                        if (!$bahan) continue;

                        $pemakaianTotal = $resep->jumlah_pemakaian * $item->jumlah;
                        $stokSebelumBahan = $bahan->stok;
                        $stokSesudahBahan = $stokSebelumBahan + $pemakaianTotal;

                        $bahan->update(['stok' => $stokSesudahBahan]);

                        LogStok::create([
                            'bahan_baku_id' => $bahan->id,
                            'user_id' => auth()->id(),
                            'tipe' => 'masuk',
                            'jumlah' => $pemakaianTotal,
                            'stok_sebelum' => $stokSebelumBahan,
                            'stok_sesudah' => $stokSesudahBahan,
                            'keterangan' => "Restock Batal pesanan #{$pesanan->nomor_pesanan}",
                            'referensi' => $pesanan->nomor_pesanan,
                        ]);
                    }
                }
            }
        });
    }
}
