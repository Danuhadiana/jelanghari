<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing absensis table if exists from older seed
        if (Schema::hasTable('absensis')) {
            Schema::dropIfExists('absensis');
        }

        // 1. TABEL: absensi
        if (!Schema::hasTable('absensi')) {
            Schema::create('absensi', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
                $table->date('tanggal');
                $table->unsignedBigInteger('shift_id')->nullable();
                $table->dateTime('jam_masuk')->nullable();
                $table->dateTime('jam_keluar')->nullable();
                $table->string('foto_masuk', 255)->nullable();
                $table->string('foto_keluar', 255)->nullable();
                $table->decimal('latitude_masuk', 10, 8)->nullable();
                $table->decimal('longitude_masuk', 11, 8)->nullable();
                $table->decimal('latitude_keluar', 10, 8)->nullable();
                $table->decimal('longitude_keluar', 11, 8)->nullable();
                $table->enum('status', ['hadir', 'izin', 'sakit', 'cuti', 'alpha', 'terlambat'])->default('hadir');
                $table->integer('jam_kerja_menit')->default(0);
                $table->integer('lembur_menit')->default(0);
                $table->text('keterangan')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('approved_at')->nullable();
                $table->tinyInteger('is_approved')->default(1);
                $table->timestamps();

                $table->unique(['user_id', 'tanggal']);
                $table->index('tanggal');
                $table->index(['user_id', 'tanggal']);

                // Foreign key to shift_kasirs if table exists
                if (Schema::hasTable('shift_kasirs')) {
                    $table->foreign('shift_id')->references('id')->on('shift_kasirs')->nullOnDelete();
                }
            });
        }

        // 2. TABEL: pengajuan_izin
        if (!Schema::hasTable('pengajuan_izin')) {
            Schema::create('pengajuan_izin', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
                $table->enum('tipe', ['izin', 'sakit', 'cuti'])->default('izin');
                $table->date('tanggal_mulai');
                $table->date('tanggal_selesai');
                $table->integer('total_hari')->default(1);
                $table->text('alasan');
                $table->string('lampiran', 255)->nullable();
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('approved_at')->nullable();
                $table->text('catatan_admin')->nullable();
                $table->timestamps();

                $table->index('user_id');
                $table->index('status');
            });
        }

        // 3. TABEL: pengaturan_absensi
        if (!Schema::hasTable('pengaturan_absensi')) {
            Schema::create('pengaturan_absensi', function (Blueprint $table) {
                $table->id();
                $table->string('kunci')->unique();
                $table->text('nilai');
                $table->string('deskripsi')->nullable();
                $table->timestamps();
            });

            // Seed default values
            $defaults = [
                ['kunci' => 'aktif_swafoto', 'nilai' => '1', 'deskripsi' => '1 = wajib swafoto, 0 = tidak'],
                ['kunci' => 'aktif_gps', 'nilai' => '0', 'deskripsi' => '1 = wajib GPS, 0 = tidak'],
                ['kunci' => 'radius_gps_meter', 'nilai' => '100', 'deskripsi' => 'radius dari cafe dalam meter'],
                ['kunci' => 'jam_masuk_normal', 'nilai' => '08:00', 'deskripsi' => 'batas masuk on-time'],
                ['kunci' => 'toleransi_terlambat_menit', 'nilai' => '15', 'deskripsi' => 'lewat menit toleransi dianggap terlambat'],
                ['kunci' => 'jam_pulang_normal', 'nilai' => '17:00', 'deskripsi' => 'batas minimal jam pulang'],
                ['kunci' => 'wajib_approval_izin', 'nilai' => '1', 'deskripsi' => '1 = izin harus diapprove admin'],
                ['kunci' => 'maks_absen_per_hari', 'nilai' => '1', 'deskripsi' => '1 = 1x absen per hari'],
                ['kunci' => 'latitude_cafe', 'nilai' => '-6.20000000', 'deskripsi' => 'Latitude lokasi cafe Jelang Hari'],
                ['kunci' => 'longitude_cafe', 'nilai' => '106.81666600', 'deskripsi' => 'Longitude lokasi cafe Jelang Hari'],
            ];

            foreach ($defaults as $d) {
                DB::table('pengaturan_absensi')->updateOrInsert(
                    ['kunci' => $d['kunci']],
                    ['nilai' => $d['nilai'], 'deskripsi' => $d['deskripsi'], 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_absensi');
        Schema::dropIfExists('pengajuan_izin');
        Schema::dropIfExists('absensi');
    }
};
