<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    public static function success(
        mixed $data = null,
        ?string $message = null,
        int $status = 200,
        array $headers = [],
    ): JsonResponse {
        $payload = ['data' => $data];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status, $headers);
    }

    public static function collection(
        array $data,
        array $meta = [],
        ?string $message = null,
        int $status = 200,
        array $headers = [],
    ): JsonResponse {
        $payload = ['data' => $data];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        if ($message !== null) {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status, $headers);
    }

    public static function error(
        string $message,
        array $errors = [],
        ?string $code = null,
        int $status = 422,
        array $headers = [],
    ): JsonResponse {
        $payload = ['message' => $message];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        if ($code !== null) {
            $payload['code'] = $code;
        }

        return response()->json($payload, $status, $headers);
    }
}
