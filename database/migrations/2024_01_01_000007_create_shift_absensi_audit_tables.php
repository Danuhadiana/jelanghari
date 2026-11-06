<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_kasirs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('waktu_buka');
            $table->timestamp('waktu_tutup')->nullable();
            $table->decimal('modal_awal', 14, 2)->default(0);
            $table->decimal('total_penjualan_cash', 14, 2)->default(0);
            $table->decimal('total_penjualan_non_cash', 14, 2)->default(0);
            $table->decimal('total_refund', 14, 2)->default(0);
            $table->decimal('kas_diharapkan', 14, 2)->default(0);
            $table->decimal('kas_aktual', 14, 2)->nullable();
            $table->decimal('selisih', 14, 2)->nullable();
            $table->enum('status', ['aktif', 'tutup'])->default('aktif');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('absensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('tanggal');
            $table->time('jam_masuk')->nullable();
            $table->time('jam_pulang')->nullable();
            $table->string('foto_masuk')->nullable();
            $table->string('foto_pulang')->nullable();
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpa'])->default('hadir');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('aksi'); // CREATE, UPDATE, DELETE, VOID, REFUND, SHIFT_OPEN, SHIFT_CLOSE
            $table->string('model')->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('data_sebelum')->nullable();
            $table->json('data_sesudah')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });

        Schema::create('notifikasis', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('pesan');
            $table->enum('tipe', ['info', 'warning', 'danger', 'success'])->default('info');
            $table->boolean('dibaca')->default(false);
            $table->string('link')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasis');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('absensis');
        Schema::dropIfExists('shift_kasirs');
    }
};
