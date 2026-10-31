<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->string('name', 150);
            $table->string('slug', 160);
            $table->text('description');
            $table->string('condition', 10);
            $table->decimal('price', 12, 2);
            $table->string('product_action', 50)->nullable();
            $table->string('custom_action_text', 100)->nullable();
            $table->string('status', 20);
            $table->string('moderation_status', 20)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamp('sold_out_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->unique(['store_id', 'slug']);
            $table->index(['store_id', 'status']);
            $table->index(['category_id']);
            $table->index(['brand_id']);
            $table->index(['is_featured', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
