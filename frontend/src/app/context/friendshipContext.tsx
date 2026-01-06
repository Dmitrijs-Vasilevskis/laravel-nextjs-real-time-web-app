"use client";

import {
    createContext,
    useState,
    useContext,
    useCallback,
    useEffect,
    ReactNode,
} from "react";
import {
    FriendInterface,
    FriendPendingInterface,
} from "@/types/User/Firendship";
import {
    acceptFriendRequest,
    declineFriendRequest,
    fetchFriends,
    fetchPendingFriendRequests,
    sendFriendRequest,
} from "@/services/api/firendship";
import { useFriendshipNotification } from "../hooks/friendship/friendshipNotification";
import toast from "react-hot-toast";
import { useGlobalState } from "./globalProvider";
import { usePathname, useSearchParams } from "next/navigation";

interface FriendshipContextInterface {
    friendList: FriendInterface[];
    pendingRequests: FriendPendingInterface[];
    isLoading: boolean;
    selectedChat: FriendInterface | null;
    handleSelectChat: (data: FriendInterface | null) => void;
    fetchFriendList: () => Promise<void>;
    fetchPending: () => Promise<void>;
    updateUnreadCount: (
        friendId: number,
        increment: boolean,
        latestMessage?: string
    ) => void;
    sendRequest: (receiverId: number) => Promise<void>;
    acceptRequest: (senderId: number) => Promise<void>;
    declineRequest: (senderId: number) => Promise<void>;
    isUserInFriendList: (userId: number) => boolean;
    handleFriendRequestAccepted: (message: string) => void;
    handleFriendRequestPending: (message: string) => void;
    handleFriendRequestDeclined: (message: string) => void;
}

export const FriendshipContext = createContext<
    FriendshipContextInterface | undefined
>(undefined);

export const FriendshipProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useGlobalState();

    const [selectedChat, setSelectedChat] = useState<FriendInterface | null>(null);
    const [friendList, setFriendList] = useState<FriendInterface[]>([]);
    const [pendingRequests, setPendingRequests] = useState<
        FriendPendingInterface[]
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleSelectChat = useCallback((data: FriendInterface | null) => {
        setSelectedChat(data);
    }, []);

    const fetchFriendList = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);

        try {
            const { friendList } = await fetchFriends();
            setFriendList(friendList || []);
        } catch (error: any) {
            console.log(">>", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const fetchPending = useCallback(async () => {
        if (!user) return;

        try {
            const data = await fetchPendingFriendRequests();
            setPendingRequests(data);
        } catch (error: any) {
            console.log(">>", error);
        }
    }, [user]);

    const sendRequest = useCallback(async (receiverId: number) => {
        try {
            await sendFriendRequest(receiverId);
        } catch (error: any) {
            console.log(">>", error);
        }
    }, []);

    const acceptRequest = useCallback(
        async (senderId: number) => {
            try {
                await acceptFriendRequest(senderId);
                await Promise.all([fetchPending(), fetchFriendList()]);
            } catch (error: any) {
                console.log(">>", error);
            }
        },
        [fetchPending, fetchFriendList]
    );

    const declineRequest = useCallback(
        async (senderId: number) => {
            try {
                await declineFriendRequest(senderId);
                await fetchPending();
            } catch (error: any) {
                console.log(">>", error);
            }
        },
        [fetchPending]
    );

    const handleFriendRequestAccepted = useCallback(
        (message: string) => {
            toast.success(message);
            fetchFriendList();
        },
        [fetchFriendList]
    );

    const handleFriendRequestPending = useCallback(
        (message: string) => {
            toast.success(message);
            fetchPending();
        },
        [fetchPending]
    );

    const handleFriendRequestDeclined = useCallback(
        (message: string) => {
            toast.error(message);
            fetchPending();
        },
        [fetchPending]
    );

    const isUserInFriendList = useCallback((userId: number) => {
        return friendList.some(friend => friend.data.id === userId);
    }, [friendList]);

    const updateUnreadCount = useCallback(
        (friendId: number, increment: boolean, latestMessage?: string) => {
            setFriendList((prev) =>
                prev.map((friend) => {
                    if (friend.data.id === friendId && friend.chat) {
                        return {
                            ...friend,
                            chat: {
                                ...friend.chat,
                                unreadCount: increment
                                    ? friend.chat.unreadCount + 1
                                    : Math.max(friend.chat.unreadCount - 1, 0),
                                latestMessage:
                                    latestMessage || friend.chat.latestMessage,
                            },
                        };
                    }
                    return friend;
                })
            );
        },
        []
    );

    const resetSelectedChatState = useCallback(() => {
        setSelectedChat(null);
    }, []);

    useEffect(() => {
        resetSelectedChatState();
    }, [pathname, searchParams, resetSelectedChatState]);

    useEffect(() => {
        if (user) {
            fetchFriendList();
            fetchPending();
        }
    }, [user, fetchFriendList, fetchPending]);

    useFriendshipNotification({
        onFriendRequestAccepted: handleFriendRequestAccepted,
        onFriendRequestPending: handleFriendRequestPending,
        onFriendRequestDeclined: handleFriendRequestDeclined,
        onMessageReceived: updateUnreadCount,
    });

    const contextValue: FriendshipContextInterface = {
        friendList,
        pendingRequests,
        isLoading,
        selectedChat,
        handleSelectChat,
        fetchFriendList,
        fetchPending,
        updateUnreadCount,
        sendRequest,
        acceptRequest,
        declineRequest,
        isUserInFriendList,
        handleFriendRequestAccepted,
        handleFriendRequestPending,
        handleFriendRequestDeclined,
    };

    return (
        <FriendshipContext.Provider value={contextValue}>
            {children}
        </FriendshipContext.Provider>
    );
};

export const useFriendshipContext = () => {
    const context = useContext(FriendshipContext);
    if (!context) {
        throw new Error(
            "useFriendshipContext must be used within FriendshipProvider"
        );
    }
    return context;
};
