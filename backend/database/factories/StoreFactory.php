<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    protected $model = Store::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();
        $storeId = Str::slug($name);

        return [
            'user_id' => User::factory(),
            'store_id' => $storeId ?: 'store-'.fake()->unique()->numberBetween(100, 99999),
            'name' => $name,
            'logo_url' => null,
            'description' => fake()->sentence(),
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'full_address' => fake()->address(),
            'whatsapp' => '081234567890',
            'last_store_id_change' => null,
        ];
    }
}
