<?php

namespace Tests\Unit;

use App\Support\ApiResponse;
use Tests\TestCase;

class ApiResponseTest extends TestCase
{
    public function test_success_response_uses_the_data_message_envelope(): void
    {
        $response = ApiResponse::success(['id' => 1], 'Created', 201);

        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame([
            'data' => ['id' => 1],
            'message' => 'Created',
        ], $response->getData(true));
    }

    public function test_collection_response_uses_the_data_meta_envelope(): void
    {
        $response = ApiResponse::collection(
            [['id' => 1]],
            ['current_page' => 1, 'per_page' => 15, 'total' => 1],
        );

        $this->assertSame([
            'data' => [['id' => 1]],
            'meta' => ['current_page' => 1, 'per_page' => 15, 'total' => 1],
        ], $response->getData(true));
    }

    public function test_error_response_uses_the_error_envelope(): void
    {
        $response = ApiResponse::error(
            'Store ID sudah digunakan.',
            ['store_id' => ['Store ID sudah digunakan.']],
            'STORE_ID_TAKEN',
            422,
        );

        $this->assertSame(422, $response->getStatusCode());
        $this->assertSame([
            'message' => 'Store ID sudah digunakan.',
            'errors' => ['store_id' => ['Store ID sudah digunakan.']],
            'code' => 'STORE_ID_TAKEN',
        ], $response->getData(true));
    }
}
