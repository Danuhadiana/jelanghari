<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategoris', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->string('ikon')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });

        Schema::create('produks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategoris')->cascadeOnDelete();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('slug');
            $table->text('deskripsi')->nullable();
            $table->decimal('harga', 12, 2)->default(0);
            $table->decimal('harga_modal', 12, 2)->default(0);
            $table->string('foto')->nullable();
            $table->boolean('is_tersedia')->default(true);
            $table->boolean('is_favorite')->default(false);
            $table->boolean('kelola_stok')->default(false);
            $table->integer('stok')->default(0);
            $table->integer('min_stok')->default(5);
            $table->enum('station', ['barista', 'kitchen'])->default('barista');
            $table->integer('urutan')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('varians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produk_id')->constrained('produks')->cascadeOnDelete();
            $table->string('nama'); // e.g. Regular, Large, Hot, Iced
            $table->decimal('harga_tambahan', 12, 2)->default(0);
            $table->string('sku')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('modifier_groups', function (Blueprint $table) {
            $table->id();
            $table->string('nama'); // e.g. Level Gula, Jenis Susu, Extra Shot
            $table->boolean('wajib_pilih')->default(false);
            $table->integer('min_pilihan')->default(0);
            $table->integer('maks_pilihan')->default(1);
            $table->timestamps();
        });

        Schema::create('modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modifier_group_id')->constrained('modifier_groups')->cascadeOnDelete();
            $table->string('nama'); // e.g. Less Sugar, Oat Milk, Extra Shot
            $table->decimal('harga_tambahan', 12, 2)->default(0);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('produk_modifier_group', function (Blueprint $table) {
            $table->foreignId('produk_id')->constrained('produks')->cascadeOnDelete();
            $table->foreignId('modifier_group_id')->constrained('modifier_groups')->cascadeOnDelete();
            $table->primary(['produk_id', 'modifier_group_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk_modifier_group');
        Schema::dropIfExists('modifiers');
        Schema::dropIfExists('modifier_groups');
        Schema::dropIfExists('varians');
        Schema::dropIfExists('produks');
        Schema::dropIfExists('kategoris');
    }
};
