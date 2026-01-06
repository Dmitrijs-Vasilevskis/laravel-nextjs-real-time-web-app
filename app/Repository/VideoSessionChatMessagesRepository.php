<?php

namespace App\Repository;

use App\Models\VideoSessionChatMessage;

class VideoSessionChatMessagesRepository
{
    public function getMessages(string $sessionId)
    {
        return VideoSessionChatMessage::where('session_id', $sessionId)->get();
    }

    public function create(array $data): VideoSessionChatMessage
    {
        return VideoSessionChatMessage::create($data);
    }
}