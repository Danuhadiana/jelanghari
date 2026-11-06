<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengaturan;

class PengaturanSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['kunci' => 'nama_cafe', 'nilai' => 'Jelang Hari Coffee & Workspace', 'kategori' => 'umum', 'tipe' => 'string', 'deskripsi' => 'Nama cafe yang tampil di nota & dashboard'],
            ['kunci' => 'tagline_cafe', 'nilai' => 'Coffee, Focus & Workspace', 'kategori' => 'umum', 'tipe' => 'string', 'deskripsi' => 'Tagline cafe'],
            ['kunci' => 'alamat_cafe', 'nilai' => 'Jl. Boulevard Raya Blok A No. 12', 'kategori' => 'umum', 'tipe' => 'string', 'deskripsi' => 'Alamat lengkap cafe'],
            ['kunci' => 'telepon_cafe', 'nilai' => '0812-9876-5432', 'kategori' => 'umum', 'tipe' => 'string', 'deskripsi' => 'Nomor WhatsApp / telepon cafe'],
            ['kunci' => 'wifi_ssid', 'nilai' => 'JelangHari_Workspace', 'kategori' => 'umum', 'tipe' => 'string', 'deskripsi' => 'Nama WiFi untuk pelanggan'],
            ['kunci' => 'wifi_password', 'nilai' => 'ngopidulu123', 'kategori' => 'umum', 'tipe' => 'string', 'deskripsi' => 'Password WiFi'],
            ['kunci' => 'pajak_persen', 'nilai' => '10', 'kategori' => 'transaksi', 'tipe' => 'number', 'deskripsi' => 'Persentase Pajak Resto (PB1)'],
            ['kunci' => 'service_charge_persen', 'nilai' => '0', 'kategori' => 'transaksi', 'tipe' => 'number', 'deskripsi' => 'Persentase Service Charge'],
            ['kunci' => 'pembulatan', 'nilai' => '1', 'kategori' => 'transaksi', 'tipe' => 'boolean', 'deskripsi' => 'Bulatkan total kembalian ke ratusan terdekat'],
            ['kunci' => 'footer_struk', 'nilai' => 'Terima kasih telah singgah di Jelang Hari. Semangat harimu!', 'kategori' => 'struk', 'tipe' => 'string', 'deskripsi' => 'Pesan penutup di struk belanja'],
            ['kunci' => 'printer_lebar', 'nilai' => '58', 'kategori' => 'printer', 'tipe' => 'number', 'deskripsi' => 'Lebar kertas kasir (58mm atau 80mm)'],
        ];

        foreach ($settings as $item) {
            Pengaturan::updateOrCreate(['kunci' => $item['kunci']], $item);
        }
    }
}
