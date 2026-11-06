<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bahan_bakus', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('kategori')->default('Kopi & Susu');
            $table->string('satuan'); // gram, ml, pcs, pack
            $table->decimal('stok', 12, 2)->default(0);
            $table->decimal('min_stok', 12, 2)->default(10);
            $table->decimal('harga_beli_terakhir', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('produk_bahans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produk_id')->constrained('produks')->cascadeOnDelete();
            $table->foreignId('bahan_baku_id')->constrained('bahan_bakus')->cascadeOnDelete();
            $table->decimal('jumlah_pemakaian', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kontak')->nullable();
            $table->string('telepon')->nullable();
            $table->string('email')->nullable();
            $table->text('alamat')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('pembelians', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pembelian')->unique();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('tanggal');
            $table->decimal('total_biaya', 14, 2)->default(0);
            $table->enum('status_pembayaran', ['lunas', 'belum_lunas'])->default('lunas');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('pembelian_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pembelian_id')->constrained('pembelians')->cascadeOnDelete();
            $table->foreignId('bahan_baku_id')->constrained('bahan_bakus')->cascadeOnDelete();
            $table->decimal('jumlah', 10, 2);
            $table->decimal('harga_satuan', 12, 2);
            $table->decimal('subtotal', 14, 2);
            $table->timestamps();
        });

        Schema::create('log_stoks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bahan_baku_id')->nullable()->constrained('bahan_bakus')->cascadeOnDelete();
            $table->foreignId('produk_id')->nullable()->constrained('produks')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('tipe', ['masuk', 'keluar', 'penyesuaian', 'penjualan'])->default('masuk');
            $table->decimal('jumlah', 10, 2);
            $table->decimal('stok_sebelum', 10, 2)->default(0);
            $table->decimal('stok_sesudah', 10, 2)->default(0);
            $table->string('keterangan')->nullable();
            $table->string('referensi')->nullable(); // nomor pesanan / nomor pembelian
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_stoks');
        Schema::dropIfExists('pembelian_details');
        Schema::dropIfExists('pembelians');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('produk_bahans');
        Schema::dropIfExists('bahan_bakus');
    }
};
