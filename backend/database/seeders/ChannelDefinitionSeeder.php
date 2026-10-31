<?php

namespace Database\Seeders;

use App\Models\ChannelDefinition;
use Illuminate\Database\Seeder;

class ChannelDefinitionSeeder extends Seeder
{
    /**
     * @var array<int, array{id: string, name: string}>
     */
    private const CHANNELS = [
        ['id' => 'SHOPEE', 'name' => 'Shopee'],
        ['id' => 'TOKOPEDIA', 'name' => 'Tokopedia'],
        ['id' => 'LAZADA', 'name' => 'Lazada'],
    ];

    public function run(): void
    {
        foreach (self::CHANNELS as $channel) {
            ChannelDefinition::query()->updateOrCreate(
                ['id' => $channel['id']],
                ['name' => $channel['name']],
            );
        }
    }
}
