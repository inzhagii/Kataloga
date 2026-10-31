<?php

namespace Tests\Feature\Channel;

use App\Models\ChannelDefinition;
use Database\Seeders\ChannelDefinitionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChannelDefinitionTest extends TestCase
{
    use RefreshDatabase;

    public function test_channel_definition_seeder_is_idempotent_and_contains_only_standard_channels(): void
    {
        $this->seed(ChannelDefinitionSeeder::class);
        $this->seed(ChannelDefinitionSeeder::class);

        $this->assertDatabaseCount('channel_definitions', 3);
        $this->assertSame(
            ['LAZADA', 'SHOPEE', 'TOKOPEDIA'],
            ChannelDefinition::query()->orderBy('id')->pluck('id')->all(),
        );
        $this->assertDatabaseHas('channel_definitions', ['id' => 'SHOPEE', 'name' => 'Shopee']);
        $this->assertDatabaseHas('channel_definitions', ['id' => 'TOKOPEDIA', 'name' => 'Tokopedia']);
        $this->assertDatabaseHas('channel_definitions', ['id' => 'LAZADA', 'name' => 'Lazada']);
    }

    public function test_channel_definition_uses_its_string_id_as_primary_key(): void
    {
        $channel = ChannelDefinition::query()->create([
            'id' => 'SHOPEE',
            'name' => 'Shopee',
        ]);

        $this->assertSame('SHOPEE', $channel->getKey());
        $this->assertFalse($channel->getIncrementing());
        $this->assertSame('string', $channel->getKeyType());
    }
}
