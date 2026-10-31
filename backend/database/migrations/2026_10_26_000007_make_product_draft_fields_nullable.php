<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->foreignId('category_id')->nullable()->change();
            $table->text('description')->nullable()->change();
            $table->string('condition', 10)->nullable()->change();
            $table->decimal('price', 12, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->foreignId('category_id')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
            $table->string('condition', 10)->nullable(false)->change();
            $table->decimal('price', 12, 2)->nullable(false)->change();
        });
    }
};
