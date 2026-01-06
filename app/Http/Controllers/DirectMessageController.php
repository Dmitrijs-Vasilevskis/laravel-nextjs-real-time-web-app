<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DirectMessageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Models\User;

class DirectMessageController extends Controller
{
    /**
     *  @var User
     */
    protected $user;

    protected DirectMessageService $directMessageService;

    /**
     * Get the currently authenticated user.
     *
     * @param  Request  $request
     */
    public function __construct(
        Request $request,
        DirectMessageService $directMessageService
    ) {
        $this->user = $request->user();
        $this->directMessageService = $directMessageService;
    }

    /**
     * Send a direct message to a user.
     *
     * @param  Request  $request
     * @return Response
     */
    public function sendDirectMessage(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'receiver_id' => 'required|exists:users,id',
                'message' => 'required|string|max:255',
                'chat_id' => 'required|exists:chats,id'
            ]);

            $message = $this->directMessageService->sendMessage(
                userId: $this->user->id,
                receiverId: $request->receiver_id,
                message: $request->message,
                chatId: $request->chat_id
            );
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                503
            );
        }

        return response()->json($message);
    }

    /**
     * Retrieve direct messages exchanged between the authenticated user and a friend.
     *
     * @param  Request  $request
     * @return JsonResponse
     *
     * Validates the request for 'friend_id', 'page', and 'limit', retrieves the messages
     * between the authenticated user and the specified friend, and paginates the results.
     */
    public function getDirectMessages(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'friend_id' => 'required|exists:users,id',
                'chat_id' => 'required|exists:chats,id',
                'page' => 'integer',
                'limit' => 'integer'
            ]);

            $chatId = $request->chat_id;
            $page = $request->page ?? 1;
            $limit = $request->limit ?? 40;

            $messageCollection = $this->directMessageService->getMessages(
                chatId: $chatId,
                page: $page,
                limit: $limit
            );
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                503
            );
        }

        return response()->json($messageCollection);
    }

    /**
     * Update a direct message to mark it as read.
     *
     * @param  Request  $request
     * @return JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function readDirectMessage(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'message_id' => 'required|exists:direct_messages,id',
                'sender_id' => 'required|exists:users,id'
            ]);

            $result = $this->directMessageService->markAsRead(
                messageId: $request->message_id,
                receiverId: $this->user->id,
                senderId: $request->sender_id
            );
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                503
            );
        }

        return response()->json([
            'message_id' => $request->message_id,
            'sender_id' => $request->sender_id,
            'success' => $result
        ]);
    }
}
