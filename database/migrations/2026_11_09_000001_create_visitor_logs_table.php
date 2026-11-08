<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('visitor_logs')) {
            Schema::create('visitor_logs', function (Blueprint $table) {
                $table->id();
                $table->string('ip_address', 45)->nullable();
                $table->string('url', 255);
                $table->string('method', 10)->default('GET');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('user_name', 100)->nullable();
                $table->string('user_role', 50)->nullable();
                $table->string('device_info', 150)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('referrer', 255)->nullable();
                $table->timestamps();

                $table->index('created_at');
                $table->index('user_id');
                $table->index('ip_address');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_logs');
    }
};
