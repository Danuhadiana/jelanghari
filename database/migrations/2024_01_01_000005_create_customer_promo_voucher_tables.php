<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('telepon')->unique()->nullable();
            $table->string('email')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->integer('poin')->default(0);
            $table->decimal('total_transaksi', 14, 2)->default(0);
            $table->integer('kunjungan_count')->default(0);
            $table->timestamp('terakhir_kunjung')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->enum('tipe', ['persen', 'nominal'])->default('persen');
            $table->decimal('nilai', 10, 2)->default(0);
            $table->decimal('min_belanja', 12, 2)->default(0);
            $table->decimal('maks_potongan', 12, 2)->nullable();
            $table->integer('kuota')->default(100);
            $table->integer('terpakai')->default(0);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });

        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->enum('tipe', ['diskon_persen', 'diskon_nominal', 'buy_x_get_y', 'bundling'])->default('diskon_persen');
            $table->decimal('nilai', 10, 2)->default(0);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('hari_berlaku')->nullable(); // e.g. "Senin,Selasa,Rabu" or null for all
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promos');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('customers');
    }
};
