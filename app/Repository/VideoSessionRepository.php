<?php

declare(strict_types=1);

namespace App\Repository;

use App\Models\VideoSession;

class VideoSessionRepository
{
    public function create(array $sessionData): VideoSession
    {
        return VideoSession::create($sessionData);
    }

    public function deleteBySessionId(string $sessionId): bool
    {
        return (bool)VideoSession::where('session_id', $sessionId)->delete();
    }

    public function getActiveSessions(int $hostId) 
    {
        return VideoSession::byHost($hostId)->get();
    }

    public function findBySessionId(string $sessionId): VideoSession|null
    {
        return VideoSession::bySessionId($sessionId)->first();
    }
}