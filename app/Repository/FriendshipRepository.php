<?php 

declare(strict_types=1);

namespace App\Repository;

use App\Models\Friendship;

class FriendshipRepository
{
    public function create(array $data): Friendship
    {
        return Friendship::create(attributes: $data);
    }

    public function updateStatus(
        int $senderId,
        int $receiverId,
        string $status): bool 
    {
        return (bool)Friendship::where('sender_id', $senderId)
            ->where('receiver_id', $receiverId)
            ->update(['status' => $status]);
    }

    public function getPending(int $userId)
    {
        return Friendship::where('receiver_id', $userId)
        ->where('status', 'pending')
        ->with('sender')
        ->get();
    }

    public function findFriendshipBetween(int $senderId, int $receiverId): Friendship|null
    {
        return Friendship::where(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $senderId)
                ->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $receiverId)
                ->where('receiver_id', $senderId);
        })->first();
    }

    public function getFriendList(int $userId)
    {
        return Friendship::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)
                ->orWhere('receiver_id', $userId);
            })
            ->where('status', 'accepted')
            ->with(['sender', 'receiver'])
            ->get();
    }

    public function getgetFriendListByName(int $userId, string $searchName)
    {
        return Friendship::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)
                ->orWhere('receiver_id', $userId);
        })
            ->where('status', 'accepted')
            ->with(['sender', 'receiver'])
            ->when(($searchName), function ($query) use ($userId, $searchName) {
                $query->whereHas('sender', function ($q) use ($userId, $searchName) {
                    $q->where('id', '!=', $userId)
                        ->where('name','LIKE', "%{$searchName}%");
                })->orWhereHas('receiver', function ($q) use ($userId, $searchName) {
                    $q->where('id', '!=', $userId)
                        ->where('name','LIKE', "%{$searchName}%");
                });
            })
            ->get();
    }

    public function getFriendship(int $senderId, int $receiverId): Friendship
    {
        return Friendship::where('sender_id', $senderId)
            ->where('receiver_id', $receiverId)
            ->with('sender')
            ->first();
    }
}