<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mejas', function (Blueprint $table) {
            $table->id();
            $table->string('nomor')->unique();
            $table->string('nama')->nullable(); // e.g. Meja 01, Meja Bar, Meja Outdoor
            $table->string('area')->default('Indoor'); // Indoor, Outdoor, Workspace, Lantai 2
            $table->integer('kapasitas')->default(4);
            $table->enum('status', ['kosong', 'terisi', 'reserved'])->default('kosong');
            $table->string('qr_code')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });

        Schema::create('pesanans', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pesanan')->unique(); // e.g. JH-20241012-0001
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Kasir/Waiter
            $table->foreignId('meja_id')->nullable()->constrained('mejas')->nullOnDelete();
            $table->string('nama_pelanggan')->nullable();
            $table->string('telepon_pelanggan')->nullable();
            $table->enum('tipe_pesanan', ['dine_in', 'take_away', 'delivery'])->default('dine_in');
            
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('diskon', 14, 2)->default(0);
            $table->string('voucher_kode')->nullable();
            $table->decimal('pajak_persen', 5, 2)->default(0);
            $table->decimal('pajak_nominal', 14, 2)->default(0);
            $table->decimal('service_persen', 5, 2)->default(0);
            $table->decimal('service_nominal', 14, 2)->default(0);
            $table->decimal('pembulatan', 10, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            
            $table->decimal('bayar', 14, 2)->default(0);
            $table->decimal('kembalian', 14, 2)->default(0);
            $table->enum('metode_pembayaran', ['cash', 'qris', 'debit', 'transfer'])->default('cash');
            $table->string('referensi_pembayaran')->nullable();
            $table->enum('status_pembayaran', ['unpaid', 'paid', 'refunded'])->default('paid');
            
            $table->enum('status_pesanan', ['menunggu', 'diproses', 'siap', 'selesai', 'dibatalkan'])->default('selesai');
            $table->text('catatan')->nullable();
            $table->timestamp('waktu_bayar')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->timestamps();
        });

        Schema::create('detail_pesanans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesanan_id')->constrained('pesanans')->cascadeOnDelete();
            $table->foreignId('produk_id')->constrained('produks');
            $table->foreignId('varian_id')->nullable()->constrained('varians')->nullOnDelete();
            $table->string('nama_produk');
            $table->string('nama_varian')->nullable();
            $table->decimal('harga_satuan', 12, 2)->default(0);
            $table->integer('jumlah')->default(1);
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->text('catatan_khusus')->nullable();
            $table->enum('status_kds', ['menunggu', 'diproses', 'siap', 'disajikan'])->default('menunggu');
            $table->timestamps();
        });

        Schema::create('detail_pesanan_modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('detail_pesanan_id')->constrained('detail_pesanans')->cascadeOnDelete();
            $table->foreignId('modifier_id')->constrained('modifiers');
            $table->string('nama_modifier');
            $table->decimal('harga_tambahan', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_pesanan_modifiers');
        Schema::dropIfExists('detail_pesanans');
        Schema::dropIfExists('pesanans');
        Schema::dropIfExists('mejas');
    }
};
