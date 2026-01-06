<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repository\FriendshipRepository;
use App\Services\FriendshipService;
use Error;
use Illuminate\Http\JsonResponse;
use App\Models\User;

class FriendshipController extends Controller
{
    /**
     *  @var User
     */
    protected User $user;

    /**
     *  @var FriendshipRepository
     */
    protected FriendshipRepository $friendshipRepository;

    /**
     *  @var FriendshipService
     */
    protected FriendshipService $friendshipService;

    /**
     * Get the currently authenticated user.
     *
     * @param  Request  $request
     */
    public function __construct(
        Request $request,
        FriendshipRepository $friendshipRepository,
        FriendshipService $friendshipService
    ) {
        $this->user = $request->user();
        $this->friendshipRepository = $friendshipRepository;
        $this->friendshipService = $friendshipService;
    }

    /**
     * Send a friendship request to a user.
     * @param  Request  $request
     * 
     * @return JsonResponse
     */
    public function sendFriendRequest(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'receiver_id' => 'required|exists:users,id',
            ]);

            $senderId = $this->user->id;
            $receiverId = $request->receiver_id;

            $friendship = $this->friendshipService->sendFriendship(
                $senderId,
                $receiverId
            );
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                202
            );
        }

        return response()->json([
                'message' => 'Friend request sent successfully.',
                'friendship' => $friendship
            ],
            201
        );
    }

    /**
     * Accept a friendship request sent by another user.
     * @param  Request  $request
     * 
     * @return JsonResponse
     */
    public function acceptFriendRequest(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'sender_id' => 'required|exists:users,id',
            ]);

            $receiverId = $this->user->id;
            $senderId = $request->sender_id;

            $friendship = $this->friendshipService->acceptFriendship(
                $senderId,
                $receiverId
            );
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                202
            );
        }

        return response()->json([
            'message' => 'Friend request accepted successfully.',
            'data' => $friendship
        ]);
    }

    /**
     * Decline a friendship request sent by another user.
     * @param  Request  $request
     * 
     * @return JsonResponse
     */
    public function declineFriendRequest(Request $request): JsonResponse
    {
        $request->validate(['sender_id' => 'required|exists:users,id',
        ]);

        $receiverId = $this->user->id;
        $senderId = $request->sender_id;

        try {
            $friendship = $this->friendshipService->declineFriendship(
                $senderId,
                $receiverId
            );
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                503
            );
        }

        return response()->json([
            'message' => 'Friend request declined successfully.',
            'data' => $friendship
        ]);
    }


    /**
     * 
     * @param  Request  $request
     * 
     * @return JsonResponse
     */
    public function removeFriend(Request $request): JsonResponse
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $userId = $this->user->id;
        $friendId = $request->friend_id;

        try {
            $friendship = $this->friendshipService->removeFriendship($userId, $friendId);

            if (!$friendship) {
                return response()->json(data: ['message' => 'Friend not found'], status: 200);
            }
        } catch (Error $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                503
            );
        }

        return response()->json(['message' => 'Friend deleted successfully'], 200);
    }

    /**
     * Fetches the list of friends for the authenticated user, including their
     * latest message and count of unread messages.
     *
     * @return JsonResponse
     */
    public function fetchFriendList(): JsonResponse
    {
        $userId = $this->user->id;

        try {
            $friendList = $this->friendshipService->getFriendList($userId);
        } catch (Error $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                503
            );
        }

        return response()->json(['friendList' => $friendList], 200);
    }

    public function fetchSortedFriendList(Request $request): JsonResponse
    {
        $userId = $this->user->id;

        try {
            $request->validate([
                'searchByName' => 'required|string',
            ]);

            $sortedFriendList = $this->friendshipService->getFriendList($userId, $request->searchByName);
        } catch (Error $e) {
            return response()->json(
                data: ['message' => $e->getMessage()],
                status: 503
            );
        }

        return response()->json(['sortedFriendList' => $sortedFriendList], 200);
    }


    /**
     * Fetches the pending friend requests for the authenticated user.
     *
     * @return JsonResponse
     */
    public function getPendingRequests(): JsonResponse
    {
        try {
            $pendingRequests = $this->friendshipService->getPendingFriendship($this->user->id);
        } catch (\DomainException $e) {
            return response()->json($e, 503);
        }

        return response()->json($pendingRequests);
    }
}
