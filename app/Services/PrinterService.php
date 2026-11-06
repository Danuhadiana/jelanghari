<?php

namespace App\Services;

use App\Models\Pesanan;
use App\Models\Pengaturan;

class PrinterService
{
    /**
     * Generate 58mm / 80mm ESC/POS raw command buffer formatted string
     */
    public function formatStrukKasir(Pesanan $pesanan): string
    {
        $namaCafe = Pengaturan::get('nama_cafe', 'JELANG HARI');
        $tagline = Pengaturan::get('tagline_cafe', 'Coffee & Workspace');
        $alamat = Pengaturan::get('alamat_cafe', 'Jl. AH Nasution No 293, Mangkubumi');
        $telepon = Pengaturan::get('telepon_cafe', '0812-3456-7890');
        $footer = Pengaturan::get('footer_struk', 'Terima kasih atas kunjungan Anda!');
        $wifiSsid = Pengaturan::get('wifi_ssid', 'JelangHari_Guest');
        $wifiPass = Pengaturan::get('wifi_password', 'kopidanfokus');

        $lines = [];
        $lines[] = "\x1B\x40"; // ESC @ Initialize
        $lines[] = "\x1B\x61\x01"; // ESC a 1 Align Center
        $lines[] = "\x1B\x21\x30" . strtoupper($namaCafe) . "\n"; // Double height/width
        $lines[] = "\x1B\x21\x00" . $tagline . "\n";
        $lines[] = $alamat . "\n";
        $lines[] = "Telp: " . $telepon . "\n";
        $lines[] = str_repeat("-", 32) . "\n";

        // Metadata
        $lines[] = "\x1B\x61\x00"; // ESC a 0 Align Left
        $lines[] = "No: " . $pesanan->nomor_pesanan . "\n";
        $lines[] = "Tgl: " . $pesanan->created_at->format('d/m/Y H:i') . "\n";
        $lines[] = "Kasir: " . ($pesanan->user->name ?? 'Kasir') . "\n";
        $lines[] = "Tipe: " . strtoupper(str_replace('_', ' ', $pesanan->tipe_pesanan)) . 
                   ($pesanan->meja ? " (Meja {$pesanan->meja->nomor})" : "") . "\n";
        if ($pesanan->nama_pelanggan) {
            $lines[] = "Pelanggan: " . $pesanan->nama_pelanggan . "\n";
        }
        $lines[] = str_repeat("-", 32) . "\n";

        // Items
        foreach ($pesanan->details as $item) {
            $nama = $item->nama_produk . ($item->nama_varian ? " ({$item->nama_varian})" : "");
            $sub = number_format($item->subtotal, 0, ',', '.');
            $lines[] = $nama . "\n";
            $lines[] = sprintf("  %2dx %-14s %10s\n", $item->jumlah, number_format($item->harga_satuan, 0, ',', '.'), $sub);
            
            if ($item->modifiers && $item->modifiers->isNotEmpty()) {
                foreach ($item->modifiers as $mod) {
                    $lines[] = sprintf("   + %-16s %8s\n", $mod->nama_modifier, number_format($mod->harga_tambahan, 0, ',', '.'));
                }
            }
            if ($item->catatan_khusus) {
                $lines[] = "   * " . $item->catatan_khusus . "\n";
            }
        }

        $lines[] = str_repeat("-", 32) . "\n";

        // Totals
        $lines[] = sprintf("%-18s %13s\n", "Subtotal:", number_format($pesanan->subtotal, 0, ',', '.'));
        if ($pesanan->diskon > 0) {
            $lines[] = sprintf("%-18s-%13s\n", "Diskon:", number_format($pesanan->diskon, 0, ',', '.'));
        }
        if ($pesanan->pajak_nominal > 0) {
            $lines[] = sprintf("%-18s %13s\n", "PB1 ({$pesanan->pajak_persen}%):", number_format($pesanan->pajak_nominal, 0, ',', '.'));
        }
        if ($pesanan->service_nominal > 0) {
            $lines[] = sprintf("%-18s %13s\n", "Service ({$pesanan->service_persen}%):", number_format($pesanan->service_nominal, 0, ',', '.'));
        }
        $lines[] = "\x1B\x45\x01"; // Bold ON
        $lines[] = sprintf("%-18s %13s\n", "TOTAL:", number_format($pesanan->total, 0, ',', '.'));
        $lines[] = "\x1B\x45\x00"; // Bold OFF

        // Payment info
        $lines[] = sprintf("%-18s %13s\n", strtoupper($pesanan->metode_pembayaran) . ":", number_format($pesanan->bayar, 0, ',', '.'));
        $lines[] = sprintf("%-18s %13s\n", "Kembalian:", number_format($pesanan->kembalian, 0, ',', '.'));
        $lines[] = str_repeat("-", 32) . "\n";

        // WiFi info & Footer
        $lines[] = "\x1B\x61\x01"; // Align Center
        if ($wifiSsid) {
            $lines[] = "WiFi: {$wifiSsid} | Pass: {$wifiPass}\n";
        }
        $lines[] = $footer . "\n\n";
        $lines[] = "\x1D\x56\x41\x03"; // GS V A 3 Paper Cut
        
        return implode("", $lines);
    }
}
