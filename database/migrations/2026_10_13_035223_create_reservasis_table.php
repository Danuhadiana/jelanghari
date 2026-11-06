<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama_pemesan');
            $table->string('telepon');
            $table->date('tanggal');
            $table->string('jam', 10);
            $table->unsignedInteger('durasi_jam')->default(2);
            $table->unsignedInteger('jumlah_orang')->default(2);
            $table->foreignId('meja_id')->nullable()->constrained('mejas')->nullOnDelete();
            $table->enum('status', ['menunggu', 'dikonfirmasi', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->decimal('dp_nominal', 12, 2)->default(0);
            $table->text('catatan')->nullable();
            $table->text('catatan_admin')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservasis');
    }
};
