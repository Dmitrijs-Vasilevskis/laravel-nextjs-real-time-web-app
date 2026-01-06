<?php

declare(strict_types=1);

namespace App\Repository;

use App\Models\DirectMessage;

class DirectMessageRepository
{
    public function create(array $data): DirectMessage
    {
        return DirectMessage::create(attributes: $data);
    }

    public function findByChat(int $chatId, int $page, int $limit)
    {
        return DirectMessage::where('chat_id', $chatId)
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();
    }


    public function markAsRead(int $messageId, int $receiverId)
    {
        return DirectMessage::where('id', $messageId)
            ->where('receiver_id', $receiverId)
            ->update(['is_read' => true]);
    }

    public function findLatestMessage($chatId): DirectMessage|null
    {
        return DirectMessage::where('chat_id', $chatId)->latest()->first();
    }

    public function getUnreadMessageCount(int $userId, array $chatIds)
    {
        return DirectMessage::selectRaw('chat_id, sender_id, COUNT(*) as unread_count')
            ->whereIn('chat_id', $chatIds)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->groupBy('chat_id', 'sender_id')
            ->get()
            ->keyBy(fn($row) => $row->chat_id . '-' . $row->sender_id);
    }
}