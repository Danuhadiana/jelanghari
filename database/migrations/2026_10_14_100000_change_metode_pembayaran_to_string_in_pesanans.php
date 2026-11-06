<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pesanans', function (Blueprint $table) {
            $table->string('metode_pembayaran', 50)->default('cash')->change();
        });
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pesanans MODIFY COLUMN metode_pembayaran ENUM('cash', 'qris', 'debit', 'transfer') DEFAULT 'cash'");
    }
};
