<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\BahanBaku;
use App\Models\Produk;
use App\Models\ProdukBahan;
use App\Models\Voucher;
use App\Models\Promo;

class InventoriSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Suppliers
        $supCoffee = Supplier::create([
            'nama' => 'Jawara Roastery',
            'kontak' => 'Bambang Roaster',
            'telepon' => '0812-1111-2222',
            'email' => 'order@jawararoastery.com',
            'alamat' => 'Jl. Kebon Jeruk No. 15, Bandung',
            'catatan' => 'Supplier biji kopi Arabika Fullwash & Natural House Blend',
        ]);

        $supDairy = Supplier::create([
            'nama' => 'CV Sumber Susu Murni',
            'kontak' => 'Ibu Ratna',
            'telepon' => '0813-3333-4444',
            'email' => 'sales@sumbersusu.id',
            'alamat' => 'Kawasan Industri Cikarang Blok B2',
            'catatan' => 'Supplier Greenfields Fresh Milk & Oatside Barista Edition',
        ]);

        // 2. Bahan Baku
        $beans = BahanBaku::create([
            'kode' => 'RAW-001',
            'nama' => 'House Blend Espresso Beans',
            'kategori' => 'Kopi',
            'satuan' => 'gram',
            'stok' => 5000,
            'min_stok' => 1000,
            'harga_beli_terakhir' => 220, // Rp 220 / gram (Rp 220.000 / kg)
        ]);

        $freshMilk = BahanBaku::create([
            'kode' => 'RAW-002',
            'nama' => 'Greenfields Fresh Milk',
            'kategori' => 'Susu',
            'satuan' => 'ml',
            'stok' => 18000,
            'min_stok' => 3000,
            'harga_beli_terakhir' => 26, // Rp 26 / ml (Rp 26.000 / 1L)
        ]);

        $gulaAren = BahanBaku::create([
            'kode' => 'RAW-003',
            'nama' => 'Sirup Gula Aren Organik Cair',
            'kategori' => 'Sirup',
            'satuan' => 'ml',
            'stok' => 4500,
            'min_stok' => 1000,
            'harga_beli_terakhir' => 35, // Rp 35 / ml (Rp 35.000 / 1L)
        ]);

        $matchaPowder = BahanBaku::create([
            'kode' => 'RAW-004',
            'nama' => 'Pure Kyoto Matcha Powder',
            'kategori' => 'Bubuk',
            'satuan' => 'gram',
            'stok' => 800,
            'min_stok' => 200,
            'harga_beli_terakhir' => 450, // Rp 450 / gram
        ]);

        // 3. Recipes (Produk Bahan)
        $kopiSusu = Produk::where('kode', 'SIG-001')->first();
        if ($kopiSusu) {
            ProdukBahan::create(['produk_id' => $kopiSusu->id, 'bahan_baku_id' => $beans->id, 'jumlah_pemakaian' => 18]); // 18 gr espresso
            ProdukBahan::create(['produk_id' => $kopiSusu->id, 'bahan_baku_id' => $freshMilk->id, 'jumlah_pemakaian' => 120]); // 120 ml susu
            ProdukBahan::create(['produk_id' => $kopiSusu->id, 'bahan_baku_id' => $gulaAren->id, 'jumlah_pemakaian' => 25]); // 25 ml gula aren
        }

        $americano = Produk::where('kode', 'CLS-001')->first();
        if ($americano) {
            ProdukBahan::create(['produk_id' => $americano->id, 'bahan_baku_id' => $beans->id, 'jumlah_pemakaian' => 18]);
        }

        $matcha = Produk::where('kode', 'NON-001')->first();
        if ($matcha) {
            ProdukBahan::create(['produk_id' => $matcha->id, 'bahan_baku_id' => $matchaPowder->id, 'jumlah_pemakaian' => 12]);
            ProdukBahan::create(['produk_id' => $matcha->id, 'bahan_baku_id' => $freshMilk->id, 'jumlah_pemakaian' => 150]);
        }

        // 4. Sample Vouchers
        Voucher::create([
            'kode' => 'JELANGPAGI',
            'nama' => 'Diskon Morning Coffee 15%',
            'tipe' => 'persen',
            'nilai' => 15,
            'min_belanja' => 30000,
            'maks_potongan' => 10000,
            'kuota' => 200,
            'terpakai' => 12,
            'tanggal_mulai' => now()->startOfMonth(),
            'tanggal_selesai' => now()->addMonths(2)->endOfMonth(),
            'is_aktif' => true,
        ]);

        Voucher::create([
            'kode' => 'HEMAT10RB',
            'nama' => 'Potongan Langsung 10 Ribu',
            'tipe' => 'nominal',
            'nilai' => 10000,
            'min_belanja' => 50000,
            'maks_potongan' => null,
            'kuota' => 100,
            'terpakai' => 25,
            'tanggal_mulai' => now()->startOfMonth(),
            'tanggal_selesai' => now()->addMonths(1)->endOfMonth(),
            'is_aktif' => true,
        ]);

        // 5. Sample Promos
        Promo::create([
            'nama' => 'Happy Hour Workspace',
            'deskripsi' => 'Diskon 20% semua kopi di jam 14:00 - 17:00 hari kerja',
            'tipe' => 'diskon_persen',
            'nilai' => 20,
            'tanggal_mulai' => now()->startOfMonth(),
            'tanggal_selesai' => now()->addYear(),
            'hari_berlaku' => 'Senin,Selasa,Rabu,Kamis,Jumat',
            'jam_mulai' => '14:00:00',
            'jam_selesai' => '17:00:00',
            'is_aktif' => true,
        ]);
    }
}
