<?php

namespace Tests\Feature\Store;

use App\Models\Store;
use App\Models\StoreAlias;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Origin', 'http://localhost:5173');
    }

    // ─── Authentication ───────────────────────────────────────────────

    public function test_guest_cannot_create_store(): void
    {
        $this->postJson('/stores', [
            'name' => 'Toko Saya',
            'store_id' => 'toko-saya',
        ])->assertUnauthorized();
    }

    public function test_guest_cannot_read_my_store(): void
    {
        $this->getJson('/stores/me')->assertUnauthorized();
    }

    public function test_guest_cannot_update_store(): void
    {
        $this->patchJson('/stores/me', [
            'name' => 'Updated',
        ])->assertUnauthorized();
    }

    // ─── Create Store ─────────────────────────────────────────────────

    public function test_customer_can_create_store(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/stores', [
            'name' => 'Toko Komputer Jaya',
            'store_id' => 'toko-komputer-jaya',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.store_id', 'toko-komputer-jaya')
            ->assertJsonPath('data.name', 'Toko Komputer Jaya')
            ->assertJsonPath('message', 'Toko berhasil dibuat.');

        $this->assertDatabaseHas('stores', [
            'user_id' => $user->id,
            'store_id' => 'toko-komputer-jaya',
            'name' => 'Toko Komputer Jaya',
        ]);
    }

    public function test_store_is_linked_to_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => 'my-store',
        ])->assertCreated();

        $store = Store::query()->where('store_id', 'my-store')->firstOrFail();
        $this->assertEquals($user->id, $store->user_id);
    }

    public function test_customer_cannot_create_second_store(): void
    {
        $user = User::factory()->create();
        Store::factory()->create(['user_id' => $user->id, 'store_id' => 'existing-store']);

        $response = $this->actingAs($user)->postJson('/stores', [
            'name' => 'Second Store',
            'store_id' => 'second-store',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('code', 'store_already_exists');
    }

    public function test_admin_cannot_create_store(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson('/stores', [
            'name' => 'Admin Store',
            'store_id' => 'admin-store',
        ]);

        $response->assertForbidden()
            ->assertJsonPath('code', 'forbidden');
    }

    public function test_payload_cannot_override_store_owner(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => 'my-store',
            'user_id' => $otherUser->id, // should be ignored
        ])->assertCreated();

        $store = Store::query()->where('store_id', 'my-store')->firstOrFail();
        $this->assertEquals($user->id, $store->user_id);
    }

    // ─── Store ID Normalization ───────────────────────────────────────

    public function test_store_id_is_normalized_to_lowercase(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => 'My-Store-ID',
        ])->assertCreated()
            ->assertJsonPath('data.store_id', 'my-store-id');

        $this->assertDatabaseHas('stores', [
            'store_id' => 'my-store-id',
        ]);
    }

    public function test_store_id_is_trimmed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => '  my-store  ',
        ])->assertCreated()
            ->assertJsonPath('data.store_id', 'my-store');
    }

    // ─── Store ID Uniqueness ──────────────────────────────────────────

    public function test_duplicate_store_id_is_rejected(): void
    {
        Store::factory()->create(['store_id' => 'taken-id']);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/stores', [
            'name' => 'Another Store',
            'store_id' => 'taken-id',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('code', 'STORE_ID_TAKEN');
    }

    public function test_duplicate_store_id_case_insensitive(): void
    {
        Store::factory()->create(['store_id' => 'my-store']);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/stores', [
            'name' => 'Another Store',
            'store_id' => 'MY-STORE',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('code', 'STORE_ID_TAKEN');
    }

    // ─── Store ID Validation ──────────────────────────────────────────

    public function test_store_id_with_invalid_format_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => '-invalid-id-',
        ])->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['store_id']]);
    }

    public function test_store_id_with_consecutive_hyphens_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => 'my--store',
        ])->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['store_id']]);
    }

    public function test_store_id_exceeding_max_length_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => str_repeat('a', 51),
        ])->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['store_id']]);
    }

    public function test_create_store_without_name_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'store_id' => 'valid-id',
        ])->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['name']]);
    }

    public function test_create_store_without_store_id_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
        ])->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['store_id']]);
    }

    // ─── Read My Store ────────────────────────────────────────────────

    public function test_customer_can_read_own_store(): void
    {
        $user = User::factory()->create();
        $store = Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'my-toko',
            'name' => 'My Toko',
        ]);

        $response = $this->actingAs($user)->getJson('/stores/me');

        $response->assertOk()
            ->assertJsonPath('data.store_id', 'my-toko')
            ->assertJsonPath('data.name', 'My Toko');
    }

    public function test_customer_without_store_gets_null(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/stores/me');

        $response->assertOk()
            ->assertJsonPath('data', null);
    }

    public function test_user_cannot_read_other_user_store_via_me_endpoint(): void
    {
        $owner = User::factory()->create();
        Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'owner-store']);

        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)->getJson('/stores/me');

        $response->assertOk()
            ->assertJsonPath('data', null);
    }

    // ─── Update Store ─────────────────────────────────────────────────

    public function test_customer_can_update_store_name(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'my-store',
            'name' => 'Old Name',
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'name' => 'New Name',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.store_id', 'my-store');

        $this->assertDatabaseHas('stores', [
            'store_id' => 'my-store',
            'name' => 'New Name',
        ]);
    }

    public function test_customer_can_update_store_description(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'my-store',
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'description' => 'Updated bio',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.description', 'Updated bio');
    }

    public function test_customer_without_store_cannot_update(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'name' => 'New Name',
        ]);

        $response->assertNotFound()
            ->assertJsonPath('code', 'store_not_found');
    }

    public function test_user_cannot_update_other_user_store(): void
    {
        $owner = User::factory()->create();
        Store::factory()->create([
            'user_id' => $owner->id,
            'store_id' => 'owner-store',
            'name' => 'Owner Store',
        ]);

        $otherUser = User::factory()->create();

        // The /stores/me endpoint scopes to auth user, so this returns 404
        $response = $this->actingAs($otherUser)->patchJson('/stores/me', [
            'name' => 'Hacked Name',
        ]);

        $response->assertNotFound();

        // Verify original store is unchanged
        $this->assertDatabaseHas('stores', [
            'store_id' => 'owner-store',
            'name' => 'Owner Store',
        ]);
    }

    // ─── Store ID Change + Cooldown ───────────────────────────────────

    public function test_customer_can_change_store_id(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'old-id',
            'last_store_id_change' => null,
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => 'new-id',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.store_id', 'new-id');

        $this->assertDatabaseHas('stores', ['store_id' => 'new-id']);
        $this->assertDatabaseMissing('stores', ['store_id' => 'old-id']);
    }

    public function test_store_id_change_creates_alias(): void
    {
        $user = User::factory()->create();
        $store = Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'old-id',
            'last_store_id_change' => null,
        ]);

        $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => 'new-id',
        ])->assertOk();

        $this->assertDatabaseHas('store_aliases', [
            'store_id' => $store->id,
            'alias' => 'old-id',
        ]);

        $alias = StoreAlias::query()->where('alias', 'old-id')->firstOrFail();
        $this->assertTrue($alias->expires_at->isFuture());
    }

    public function test_store_id_change_records_timestamp(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'old-id',
            'last_store_id_change' => null,
        ]);

        $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => 'new-id',
        ])->assertOk();

        $store = Store::query()->where('store_id', 'new-id')->firstOrFail();
        $this->assertNotNull($store->last_store_id_change);
    }

    public function test_store_id_cooldown_blocks_change_within_30_days(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'current-id',
            'last_store_id_change' => now()->subDays(15),
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => 'another-id',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('code', 'STORE_ID_COOLDOWN');

        $this->assertDatabaseHas('stores', ['store_id' => 'current-id']);
    }

    public function test_store_id_change_allowed_after_30_day_cooldown(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'current-id',
            'last_store_id_change' => now()->subDays(31),
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => 'new-id',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.store_id', 'new-id');
    }

    // ─── Alias Protection ─────────────────────────────────────────────

    public function test_active_alias_blocks_new_store_id(): void
    {
        $existingStore = Store::factory()->create(['store_id' => 'existing-store']);
        StoreAlias::query()->create([
            'store_id' => $existingStore->id,
            'alias' => 'protected-alias',
            'expires_at' => now()->addDays(60),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/stores', [
            'name' => 'New Store',
            'store_id' => 'protected-alias',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('code', 'STORE_ID_TAKEN');
    }

    public function test_expired_alias_allows_store_id_reuse(): void
    {
        $existingStore = Store::factory()->create(['store_id' => 'existing-store']);
        StoreAlias::query()->create([
            'store_id' => $existingStore->id,
            'alias' => 'expired-alias',
            'expires_at' => now()->subDay(),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/stores', [
            'name' => 'New Store',
            'store_id' => 'expired-alias',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.store_id', 'expired-alias');
    }

    public function test_alias_case_insensitive_protection(): void
    {
        $existingStore = Store::factory()->create(['store_id' => 'existing-store']);
        StoreAlias::query()->create([
            'store_id' => $existingStore->id,
            'alias' => 'protected-alias',
            'expires_at' => now()->addDays(60),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/stores', [
            'name' => 'New Store',
            'store_id' => 'PROTECTED-ALIAS',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('code', 'STORE_ID_TAKEN');
    }

    // ─── Store ID Change Atomicity ────────────────────────────────────

    public function test_store_id_change_does_not_leave_partial_state_on_conflict(): void
    {
        $existingStore = Store::factory()->create(['store_id' => 'taken-id']);

        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'my-store',
            'last_store_id_change' => null,
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => 'taken-id',
        ]);

        $response->assertStatus(409);

        // Store ID unchanged
        $this->assertDatabaseHas('stores', [
            'user_id' => $user->id,
            'store_id' => 'my-store',
        ]);

        // No alias was created for the failed change
        $this->assertDatabaseMissing('store_aliases', [
            'alias' => 'my-store',
        ]);
    }

    // ─── Same Store ID Update (no change) ─────────────────────────────

    public function test_updating_with_same_store_id_does_not_trigger_cooldown(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'my-store',
            'name' => 'Old Name',
            'last_store_id_change' => now()->subDays(5), // within cooldown
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => 'my-store', // same ID
            'name' => 'New Name',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.store_id', 'my-store');
    }

    // ─── Validation Error Envelope ────────────────────────────────────

    public function test_validation_errors_return_consistent_envelope(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/stores', []);

        $response->assertUnprocessable()
            ->assertJsonStructure([
                'message',
                'errors' => ['name', 'store_id'],
            ]);
    }

    // ─── Availability Endpoint ────────────────────────────────────────

    public function test_availability_returns_true_for_unused_store_id(): void
    {
        $response = $this->getJson('/stores/availability?store_id=available-id');

        $response->assertOk()
            ->assertJsonPath('data.available', true);
    }

    public function test_availability_returns_false_for_taken_store_id(): void
    {
        Store::factory()->create(['store_id' => 'taken-id']);

        $response = $this->getJson('/stores/availability?store_id=taken-id');

        $response->assertOk()
            ->assertJsonPath('data.available', false);
    }

    public function test_availability_returns_false_for_active_alias(): void
    {
        $store = Store::factory()->create(['store_id' => 'current-id']);
        StoreAlias::query()->create([
            'store_id' => $store->id,
            'alias' => 'old-alias',
            'expires_at' => now()->addDays(60),
        ]);

        $response = $this->getJson('/stores/availability?store_id=old-alias');

        $response->assertOk()
            ->assertJsonPath('data.available', false);
    }

    public function test_availability_case_insensitive(): void
    {
        Store::factory()->create(['store_id' => 'my-store']);

        $response = $this->getJson('/stores/availability?store_id=MY-STORE');

        $response->assertOk()
            ->assertJsonPath('data.available', false);
    }

    public function test_availability_without_param_returns_422(): void
    {
        $response = $this->getJson('/stores/availability');

        $response->assertUnprocessable();
    }

    // ─── UserResource reflects store ──────────────────────────────────

    public function test_auth_me_reflects_store_after_creation(): void
    {
        $user = User::factory()->create();

        // Before store creation
        $this->actingAs($user)->getJson('/auth/me')
            ->assertOk()
            ->assertJsonPath('data.has_store', false)
            ->assertJsonPath('data.store_id', null);

        // Create store
        $this->actingAs($user)->postJson('/stores', [
            'name' => 'My Store',
            'store_id' => 'my-store',
        ])->assertCreated();

        // After store creation — clear relation cache
        $user->refresh();

        $this->actingAs($user)->getJson('/auth/me')
            ->assertOk()
            ->assertJsonPath('data.has_store', true)
            ->assertJsonPath('data.store_id', 'my-store');
    }

    // ─── Partial update semantics ─────────────────────────────────────

    public function test_partial_update_only_changes_provided_fields(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'my-store',
            'name' => 'Original Name',
            'description' => 'Original Desc',
            'whatsapp' => '081234567890',
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'description' => 'Updated Desc',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Original Name')
            ->assertJsonPath('data.description', 'Updated Desc')
            ->assertJsonPath('data.whatsapp', '081234567890');
    }

    public function test_update_can_set_nullable_fields_to_null(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'my-store',
            'description' => 'Some description',
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'description' => null,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.description', null);
    }

    // ─── Store ID normalization on update ──────────────────────────────

    public function test_store_id_normalized_on_update(): void
    {
        $user = User::factory()->create();
        Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => 'old-id',
            'last_store_id_change' => null,
        ]);

        $response = $this->actingAs($user)->patchJson('/stores/me', [
            'store_id' => '  NEW-ID  ',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.store_id', 'new-id');
    }
}
