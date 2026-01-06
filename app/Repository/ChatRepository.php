<?php

declare(strict_types=1);

namespace App\Repository;

use App\Models\Chat;
use App\Models\Friendship;

class ChatRepository
{
    public function create(Friendship $friendship)
    {
        return Chat::create()->participants()->createMany([
            ['user_id' => $friendship->receiver_id],
            ['user_id' => $friendship->sender_id],
        ]);
    }

    public function findByParticipants($friendId, $userId): Chat|null
    {
        return Chat::whereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->whereHas('participants', function ($query) use ($friendId) {
            $query->where('user_id', $friendId);
        })->first();
    }

    public function getChatsByParticipants(int $userId, array $friendIds)
    {
        return Chat::betweenUsersBatch($userId, $friendIds)
            ->with(['latestMessage', 'participants'])
            ->get();
    }
}