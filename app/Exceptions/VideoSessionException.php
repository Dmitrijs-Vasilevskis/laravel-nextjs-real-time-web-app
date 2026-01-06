<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class VideoSessionException extends Exception
{
    protected int $statusCode;

    public function __construct(string $message, int $statusCode = 400)
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'error' => true,
            'message' => $this->getMessage()
        ], $this->statusCode);
    }
}