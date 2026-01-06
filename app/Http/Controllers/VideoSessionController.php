<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Services\VideoSessionServices;
use App\Models\User;
use Throwable;
use Illuminate\Support\Facades\Log;

class VideoSessionController extends Controller
{
    /**
     *  @var User
     */
    protected User $user;

    /**
     *  @var VideoSessionServices
     */
    protected VideoSessionServices $videoSessionServices;

    /**
     * Get the currently authenticated user.
     * 
     * @param  Request  $request
     * @param  VideoSessionServices  $videoSessionServices
     */
    public function __construct(
        Request $request,
        VideoSessionServices $videoSessionServices
    ) {
        $this->user = $request->user();
        $this->videoSessionServices = $videoSessionServices;
    }

    /**
     *  Get active video session by host_id
     * 
     * @param  Request  $request
     * @return JsonResponse
     */
    public function getActiveVideoSessions(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'host_id' => 'required',
            ]);

            $videoSessionsCollection = $this->videoSessionServices->getActiveSessionsByHost((int)$request->host_id);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->json($videoSessionsCollection);
    }

    /**
     *  Create a new video session
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function initVideoSession(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'host_id' => 'required',
                'video_id' => 'required',
            ]);

            $sessionData = [
                'host_id' => (int)$request->host_id,
                'video_id' => (string)$request->video_id,
                'token' => Str::random(40),
                'session_id' => uniqid('sess_', false),
                'is_public' => $request->is_public ?? false,
                'is_active' => true,
            ];

            $videoSession = $this->videoSessionServices->createVideoSession($sessionData);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->json($videoSession);
    }

    /**
     *  Delete a video session by creator request
     * 
     * @param  Request  $request
     * @return JsonResponse
     */
    public function deleteVideoSession(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'session_id' => 'required',
                'host_id' => 'required',
            ]);

            $this->videoSessionServices->deleteSession($request->session_id, $request->host_id, $this->user->id);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()
            ->json([
                'status' => 200,
                'message' => 'Video session deleted successfully'
            ], 200);
    }

    /**
     *  Join a video session, and broadcast join event
     * 
     * @param  Request  $request
     * @return JsonResponse
     */
    public function joinVideoSession(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'session_id' => 'required',
            ]);

            $videoSession = $this->videoSessionServices->joinSession($request->session_id, $this->user);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->json($videoSession);
    }

    /**
     *  Broadcast sync event with the latest player state
     *
     * @param  Request  $request
     * @return JsonResponse|Response
     */
    public function getVideoSessionState(Request $request): JsonResponse|Response
    {
        try {
            $request->validate([
                'session_id' => 'required|string',
                'state' => 'required|int',
                'time' => 'required'
            ]);

            $this->videoSessionServices->syncState(
                $request->session_id,
                $request->state,
                $request->time
            );
        } catch (Throwable $e) {
            Log::info($e);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->noContent();
    }

    /**
     * Broadcast sync event with the latest playlist state,
     * current video index and seconds
     *
     * @param  Request  $request
     * @return JsonResponse|Response
     */
    public function getVideoSessionPlaylistState(Request $request): JsonResponse|Response
    {
        try {
            $request->validate([
                'session_id' => 'required',
                'current_index' => 'required',
                'seconds' => 'required'
            ]);

            $this->videoSessionServices->syncPlaylistState(
                $request->session_id,
                $request->current_index,
                $request->seconds
            );
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->noContent();
    }

    /**
     * Broadcast add to queue event, with the video id for specific session
     *
     * @param  Request  $request
     * @return JsonResponse|Response
     */
    public function videoSessionAddToQueue(Request $request): JsonResponse|Response
    {
        try {
            $request->validate([
                'session_id' => 'required',
                'video_id' => 'required'
            ]);

            $this->videoSessionServices->addToQueue(
                $request->session_id,
                $request->video_id
            );
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->noContent();
    }

    /**
     * Broadcast switch playlist event,
     * with the video id for specific session
     *
     * @param  Request  $request
     * @return JsonResponse|Response
     */
    public function getVideoSessionPlayerSwitch(Request $request): JsonResponse|Response
    {
        try {
            $request->validate([
                'session_id' => 'required',
                'action' => 'required',
                'current_video_index' => 'required'
            ]);

            $this->videoSessionServices->switchPlaylist(
                $request->session_id,
                $request->action,
                $request->current_video_index
            );
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->noContent();
    }

    // todo: implement message loading with pagination to optimize performance

    /**
     *  Get video session live chat messages
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function getVideoSessionMessages(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'session_id' => 'required',
            ]);

            $videoSessionMessages = $this->videoSessionServices
                ->getSessionChatMessages($request->session_id);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->json($videoSessionMessages);
    }

    /**
     * Broadcast a new live chat message for a specific session
     *
     * @param  Request  $request
     * @return JsonResponse|Response
     */
    public function sendChatMessage(Request $request): JsonResponse|Response
    {
        try {
            $request->validate([
                'session_id' => 'required|string|exists:video_session,session_id',
                'message' => 'required|string',
                'user_id' => 'required',
                'from' => 'required|string',
                'chat_name_color' => 'required'
            ]);

            $this->videoSessionServices->sendMessage([
                'session_id' => $request->session_id,
                'user_id' => (int)$request->user_id,
                'from' => $request->from,
                'message' => $request->message,
                'chat_name_color' => $request->chat_name_color
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        return response()->noContent();
    }
}
