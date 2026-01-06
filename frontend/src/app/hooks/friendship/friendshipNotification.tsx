import { useEffect } from "react";
import { useAuth } from "../auth";
import { useEcho } from "../echo";
import { DirectMessageInterface } from "@/types/DirectMessage/DirectMessage";

interface Props {
    onFriendRequestPending: (message: string) => void;
    onFriendRequestAccepted: (message: string) => void;
    onFriendRequestDeclined: (message: string) => void;
    onMessageReceived: (
        friendId: number,
        increment: boolean,
        message: string
    ) => void;
}

export const useFriendshipNotification = ({
    onFriendRequestPending,
    onFriendRequestAccepted,
    onFriendRequestDeclined,
    onMessageReceived,
}: Props) => {
    const echo = useEcho();
    const { user } = useAuth();

    useEffect(() => {
        if (!echo || !user?.id) return;
        const notificationChannel = echo.private(`notifications.${user?.id}`);

        notificationChannel.listen(
            ".friendship.request",
            (data: { notificationType: string; message: string }) => {
                const { notificationType, message } = data;

                switch (notificationType) {
                    case "pending":
                        onFriendRequestPending(message);
                        break;
                    case "accepted":
                        onFriendRequestAccepted(message);
                        break;
                    case "declined":
                        onFriendRequestDeclined(message);
                        break;
                }
            }
        );

        const dmChannel = echo.private(`direct-message.${user?.id}`);

        dmChannel.listen(
            ".direct-message.message",
            (data: {
                message: DirectMessageInterface;
                sender_id: number;
                receiver_id: number;
            }) => {
                const { sender_id, receiver_id, message } = data;

                console.log(">> direct-message.message", data);

                if (message) {
                    const isSender = user.id === sender_id;
                    const increment = !isSender;
                    const friendId = isSender ? receiver_id : sender_id;

                    onMessageReceived(friendId, increment, message.message);
                }
            }
        );

        return () => {
            echo?.leave(`notifications.${user?.id}`);
            echo?.leave(`direct-message.${user?.id}`);
        };
    }, [echo, user]);
};
