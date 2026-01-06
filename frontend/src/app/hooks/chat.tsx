import { useCallback, useEffect, useRef, useState } from "react";
import { FriendInterface } from "@/types/User/Firendship";
import { DirectMessageInterface } from "@/types/DirectMessage/DirectMessage";
import { axios } from "../lib/axios";
import { sendReadMessageRequest } from "@/services/api/messages";
import { useFriendshipContext } from "../context/friendshipContext";
import { useEcho } from "./echo";
import { useGlobalState } from "../context/globalProvider";

export const useChat = () => {
    const { user } = useGlobalState();
    const echo = useEcho();
    const { selectedChat, handleSelectChat } = useFriendshipContext();

    const [messages, setMessages] = useState<DirectMessageInterface[]>([]);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<number>(1);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const closeChatBox = useCallback(() => {
        handleSelectChat(null);
        setMessages([]);
        setPage(1);
    }, []);

    const fetchMessages = () => {
        if (!selectedChat?.chat || !chatBoxRef.current) return;

        setLoadingMore(true);

        // Save the current scroll height before loading new messages
        const chatBox = chatBoxRef.current;
        const previousScrollHeight = chatBox.scrollHeight;
        const previousScrollTop = chatBox.scrollTop;

        axios
            .post("api/get-direct-messages", {
                chat_id: selectedChat.chat.id,
                friend_id: selectedChat.data.id,
                page: page,
                limit: 40,
            })
            .then((response: { data: DirectMessageInterface[] }) => {
                if (response.data.length < 40) {
                    setHasMore(false); // No more messages to load
                }

                const newMessages = response.data.reverse();
                setMessages((prev) => [...newMessages, ...prev]);

                setLoadingMore(false);

                // Calculate the new scroll height after appending new messages
                const newScrollHeight = chatBox.scrollHeight;

                requestAnimationFrame(() => {
                    const newScrollHeight = chatBox.scrollHeight;
                    chatBox.scrollTop =
                        previousScrollTop +
                        (newScrollHeight - previousScrollHeight);
                });
            })
            .catch((error) => {
                console.error("Error fetching messages:", error);
            });
    };

    const handleScroll = () => {
        if (
            chatBoxRef.current &&
            chatBoxRef.current.scrollTop === 0 &&
            hasMore &&
            !loadingMore
        ) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const sendDirectMessage = (message: string) => {
        if (!selectedChat?.chat || !message) return;

        axios.post("api/send-direct-message", {
            receiver_id: selectedChat.data.id,
            chat_id: selectedChat.chat.id,
            message: message,
        });
    };

    const handleAddNewMessages = (message: DirectMessageInterface) => {
        setMessages((prev) => [...prev, message]);
    };

    // todo: optimize message find, looking for in ascending order
    const handleIsMessageRead = (message_id: number) => {
        setMessages((prev) =>
            prev.map((message) => {
                if (message.id === message_id) {
                    return {
                        ...message,
                        is_read: true,
                    };
                }
                return message;
            })
        );
    };

    const readMessageRequest = async (messageId: number, senderId: number) => {
        if (!messageId && !senderId) return;

        try {
            const { message_id, sender_id } = await sendReadMessageRequest(
                messageId,
                senderId
            );

            if (message_id && sender_id) {
                handleIsMessageRead(message_id);

                return {
                    message_id: message_id,
                    sender_id: sender_id,
                };
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (selectedChat) {
            setMessages([]);
            setPage(1);
            fetchMessages();
        }
    }, [selectedChat]);

    useEffect(() => {
        fetchMessages();
    }, [page]);

    useEffect(() => {
        if (echo && selectedChat && user.id) {
            const dmChannel = echo.private(`direct-message.${user?.id}`);

            dmChannel
                .listen(
                    ".direct-message.message",
                    (data: { message: DirectMessageInterface }) => {
                        data.message && handleAddNewMessages(data.message);
                    }
                )
                .listen(
                    ".direct-message.read",
                    (data: { messageId: number; receiverId: number }) => {
                        data.messageId && handleIsMessageRead(data.messageId);
                    }
                );
        }
    }, [echo, selectedChat]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (chatBoxRef.current) {
                chatBoxRef.current.removeEventListener("scroll", handleScroll);
            }
        };
    }, [hasMore, loadingMore]);

    return {
        selectedChat,
        messages,
        chatBoxRef,
        handleSelectChat,
        sendDirectMessage,
        readMessageRequest,
        handleIsMessageRead,
        closeChatBox,
        setMessages,
    };
};
