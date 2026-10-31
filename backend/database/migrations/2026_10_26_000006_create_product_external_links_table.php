<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_external_links', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('channel_id', 50);
            $table->string('url', 500);
            $table->timestamps();

            $table->primary(['product_id', 'channel_id']);
            $table->index('channel_id');
            $table->foreign('channel_id')->references('id')->on('channel_definitions')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_external_links');
    }
};
