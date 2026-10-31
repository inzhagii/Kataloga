<?php

namespace Tests\Feature;

use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class FoundationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('api')->get('/__foundation/ping', fn () => ApiResponse::success(
            ['pong' => true],
            'OK',
        ));

        Route::middleware('api')->post('/__foundation/validate', function (Request $request) {
            $request->validate([
                'name' => ['required', 'string'],
            ]);

            return ApiResponse::success([
                'name' => $request->string('name')->toString(),
            ], 'OK');
        });

        Route::middleware(['api', 'auth:sanctum'])->get('/__foundation/protected', fn () => ApiResponse::success(
            ['protected' => true],
            'OK',
        ));

        Route::middleware('api')->post('/auth/__foundation/method', fn () => ApiResponse::success(
            ['ok' => true],
            'OK',
        ));
    }

    public function test_health_endpoint_is_available(): void
    {
        $this->get('/up')->assertOk();
    }

    public function test_sanctum_csrf_cookie_is_issued(): void
    {
        $response = $this->get('/sanctum/csrf-cookie');

        $response->assertNoContent();
        $response->assertCookie('XSRF-TOKEN');
    }

    public function test_api_routes_have_no_prefix_and_return_the_success_envelope(): void
    {
        $response = $this->get('/__foundation/ping');

        $response->assertOk();
        $response->assertJson([
            'data' => ['pong' => true],
            'message' => 'OK',
        ]);

        $this->assertStringStartsWith(
            'application/json',
            $response->headers->get('Content-Type', ''),
        );

        $this->getJson('/api/__foundation/ping')->assertNotFound();
    }

    public function test_api_validation_errors_are_json_without_an_accept_header(): void
    {
        $response = $this->post('/__foundation/validate');

        $response->assertUnprocessable();
        $response->assertJsonStructure([
            'message',
            'errors' => ['name'],
        ]);

        $this->assertStringStartsWith(
            'application/json',
            $response->headers->get('Content-Type', ''),
        );
    }

    public function test_api_http_errors_are_json_without_an_accept_header(): void
    {
        $notFound = $this->get('/auth/__foundation/missing');

        $notFound->assertNotFound();
        $notFound->assertJsonStructure(['message']);
        $this->assertStringStartsWith(
            'application/json',
            $notFound->headers->get('Content-Type', ''),
        );

        $methodNotAllowed = $this->get('/auth/__foundation/method');

        $methodNotAllowed->assertStatus(405);
        $methodNotAllowed->assertJsonStructure(['message']);
        $this->assertStringStartsWith(
            'application/json',
            $methodNotAllowed->headers->get('Content-Type', ''),
        );
    }

    public function test_protected_api_routes_return_json_unauthorized_responses(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost:5173')
            ->get('/__foundation/protected');

        $response->assertUnauthorized();
        $response->assertJsonStructure(['message']);

        $this->assertStringStartsWith(
            'application/json',
            $response->headers->get('Content-Type', ''),
        );
    }

    public function test_cors_preflight_allows_the_frontend_with_credentials(): void
    {
        $response = $this->call('OPTIONS', '/__foundation/ping', [], [], [], [
            'HTTP_ORIGIN' => 'http://localhost:5173',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,x-xsrf-token',
        ]);

        $response->assertNoContent();
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $response->assertHeader('Access-Control-Allow-Credentials', 'true');
    }
}
