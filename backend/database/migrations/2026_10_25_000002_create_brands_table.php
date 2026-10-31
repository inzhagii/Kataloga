<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->nullable()->constrained('stores')->cascadeOnDelete();
            $table->string('name', 150);
            $table->timestamps();
        });

        DB::statement('ALTER TABLE brands ADD COLUMN name_ci VARCHAR(150) GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED');
        DB::statement('ALTER TABLE brands ADD COLUMN scope_key BIGINT UNSIGNED GENERATED ALWAYS AS (IFNULL(store_id, 0)) STORED');
        DB::statement('CREATE UNIQUE INDEX brands_scope_name_unique ON brands (scope_key, name_ci)');
        DB::statement('CREATE INDEX brands_store_id_index ON brands (store_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
