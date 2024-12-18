<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use App\Models\Friendship;
use App\Models\Chat;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Events\Friendship\FriendshipRequestEvent;

class FriendshipController extends Controller
{
    /**
     *  @var \App\Models\User
     */
    protected $user;

    /**
     * Get the currently authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function __construct(Request $request)
    {
        $this->user = $request->user();
    }

    /**
     * Send a friendship request to a user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function sendFriendRequest(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        $senderId = $this->user->id;
        $receiverId = $request->receiver_id;

        // Check if a friendship or request already exists
        $existingRequest = Friendship::where(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $senderId)
            ->where('receiver_id', $receiverId)
                ->whereIn('status', ['pending', 'accepted']);
        })->orWhere(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $receiverId)
                ->where('receiver_id', $senderId)
                ->whereIn('status', ['pending', 'accepted']);
        })->first();

        if ($existingRequest) {
            if ($existingRequest->receiver_id === $senderId) {
                return response()->json(['message' => 'Friend request was sent to you already.'], 202);
            }

            return response()->json(['message' => 'Friend request already exists or you are already friends.'], 202);
        }

        // Create a new friend
        $friendship = Friendship::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        broadcast(new FriendshipRequestEvent(
            $receiverId,
            $friendship->status,
            sprintf('You have a new friend request.')
        ))->toOthers();

        return response()->json([
            'message' => 'Friend request sent successfully.',
            'friendship' => $friendship
        ], 201);
    }

    /**
     * Accept a friendship request sent by another user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function acceptFriendRequest(Request $request)
    {
        $request->validate(['sender_id' => 'required|exists:users,id',
        ]);

        $receiverId = $this->user->id;

        Friendship::where('sender_id', $request->sender_id)
        ->where('receiver_id', $receiverId)
        ->where('status', 'pending')
        ->update(['status' => 'accepted']);

        // Fetch the updated friendship record
        $friendship = Friendship::where('sender_id', $request->sender_id)
        ->where('receiver_id', $receiverId)
        ->with('sender')
        ->first();

        // Check if a chat already exists between the users
        $existingChat = Chat::whereHas('participants', function ($query) use ($friendship) {
            $query->where('user_id', $friendship->user_id);
        })->whereHas('participants', function ($query) use ($friendship) {
            $query->where('user_id', $friendship->friend_id);
        })->first();

        if (!$existingChat) {
            $chat = Chat::create();
            $chat->participants()->createMany([
                ['user_id' => $friendship->receiver_id],
                ['user_id' => $friendship->sender_id],
            ]);
        } else {
            $chat = $existingChat;
        }
        
        broadcast(new FriendshipRequestEvent(
            $request->sender_id,
            $friendship->status,
            sprintf('%s accepted your friend request.', $friendship->sender->name)
        ))->toOthers();

        return response()->json([
            'message' => 'Friend request accepted successfully.',
            'data' => $friendship
        ]);
    }

    /**
     * Decline a friendship request sent by another user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function declineFriendRequest(Request $request)
    {
        $request->validate(['sender_id' => 'required|exists:users,id',
        ]);

        $receiverId = $this->user->id;

        $friendship = Friendship::where('sender_id', $request->sender_id)
            ->where('receiver_id', $receiverId)
            ->where('status', 'pending')
            ->update(['status' => 'declined']);

        $friendship = Friendship::where('sender_id', $request->sender_id)
        ->where('receiver_id', $receiverId)
        ->with('sender', 'receiver')
        ->first();

        broadcast(new FriendshipRequestEvent(
            $request->sender_id,
            $friendship->status,
            sprintf('%s declined your friend request.', $friendship->receiver->name)
        ))->toOthers();

        return response()->json([
            'message' => 'Friend request declined successfully.',
            'data' => $friendship
        ]);
    }

    public function removeFriend(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $userId = $this->user->id;
        $friendId = $request->friend_id;

        $friendship = Friendship::where(function ($query) use ($userId, $friendId) {
            $query->where('sender_id', $userId)->where('receiver_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('sender_id', $friendId)->where('receiver_id', $userId);
        })->first();

        if (!$friendship) {
            return response()->json(['message' => 'Friend not found'], 404);
        }

        $friendship->delete();

        return response()->json(['message' => 'Friend deleted successfully'], 200);
    }

    /**
     * Fetches the list of friends for the authenticated user, including their
     * latest message and count of unread messages.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchFriendList()
    {
        $userId = $this->user->id;

        $friendList = Friendship::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)
                ->orWhere('receiver_id', $userId);
        })
            ->where('status', 'accepted')
            ->with(['sender', 'receiver'])
            ->get()
            ->map(function ($friendship) use ($userId) {
            // Determine the friend based on the user being the sender or receiver
            $friend = $friendship->sender_id === $userId ? $friendship->receiver : $friendship->sender;


            $chat = Chat::whereHas('participants', function ($query) use ($userId, $friend) {
                $query->where('user_id', $userId);
            })->whereHas('participants', function ($query) use ($friend) {
                $query->where('user_id', $friend->id);
            })->first();

            $latestMessage = DirectMessage::where('chat_id', $chat->id)->latest()->first();

            // Count unread messages from the friend to the user
            $unreadCount = DirectMessage::where('receiver_id', $userId)
            ->where('sender_id', $friend->id)
            ->where('is_read', false)
            ->where('chat_id', $chat->id)
            ->count();

            return [
                'data' => [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'email' => $friend->email,
                    'profile_picture_url' => $friend->profile_picture_url,
                    'chat_name_color' => $friend->chat_name_color,
                ],
                'chat' => [
                    'id' => $chat->id,
                    'chatType' => $chat->chat_type,
                    'latestMessage' => $latestMessage ? $latestMessage->message : null,
                    'sentTime' => $latestMessage ? $latestMessage->created_at->toDateTimeString() : null,
                    'unreadCount' => $unreadCount
                ]];
            });

        return response()->json(['friendList' => $friendList], 200);
    }


    /**
     * Fetches the pending friend requests for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingRequests()
    {
        $pendingRequests = Friendship::where('receiver_id', $this->user->id)
            ->where('status', 'pending')
            ->with('sender')
            ->get();

        return response()->json($pendingRequests);
    }
}
