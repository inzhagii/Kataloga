<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_aliases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('alias', 50);
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['alias', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_aliases');
    }
};
