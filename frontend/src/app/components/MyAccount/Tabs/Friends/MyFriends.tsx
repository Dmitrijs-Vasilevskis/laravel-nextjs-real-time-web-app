"use client";

import { useGlobalState } from "@/app/context/globalProvider";
import { useEffect } from "react";
import styled from "styled-components";
import Chatbox from "@/app/components/DirectMessages/Chatbox";
import FriendBar from "@/app/components/DirectMessages/FriendBar";
import { useEcho } from "@/app/hooks/echo";
import { DirectMessageInterface } from "@/types/DirectMessage/DirectMessage";
import { useChat } from "@/app/hooks/chat";
import { useFriendship } from "@/app/hooks/friendship";

export default function MyFriends() {
    const { user } = useGlobalState();

    const {
        friends,
        pendingRequests,
        searchQuery,
        isSearching,
        isSearchActive,
        handleSearch,
        clearSearch,
        updateUnreadCount,
        originalFriendList,
        searchResults,
        sendRequest,
        acceptRequest,
        declineRequest,
        selectedChat,
        handleSelectChat,
    } = useFriendship();

    const echo = useEcho();

    const {
        messages,
        chatBoxRef,
        sendDirectMessage,
        readMessageRequest,
        closeChatBox,
        setMessages,
    } = useChat();

    // const handleAddNewMessages = (message: DirectMessageInterface) => {
    //     setMessages((prev) => [...prev, message]);
    // };

    // const handleIsMessageRead = (message_id: number) => {
    //     setMessages((prev) =>
    //         prev.map((message) => {
    //             if (message.id === message_id) {
    //                 return {
    //                     ...message,
    //                     is_read: true,
    //                 };
    //             }
    //             return message;
    //         })
    //     );
    // };

    // const handleReadMessage = (messageId: number, senderId: number) => {
    //     handleIsMessageRead(messageId);
    // };

    const handleReadMessageEvent = async (
        messageId: number,
        senderId: number
    ) => {
        readMessageRequest(messageId, senderId).then(() => {
            updateUnreadCount(senderId, false);
        });
    };

    // useEffect(() => {
    //     if (echo && selectedChat && user.id) {
    //         echo.private(`direct-message.${user?.id}`)
    //             .listen(
    //                 ".direct-message.message",
    //                 (data: { message: DirectMessageInterface }) => {
    //                     data.message && handleAddNewMessages(data.message);
    //                 }
    //             )
    //             .listen(
    //                 ".direct-message.read",
    //                 (data: { messageId: number; receiverId: number }) => {
    //                     data.messageId &&
    //                         handleReadMessage(data.messageId, data.receiverId);
    //                 }
    //             );
    //     }

    //     return () => {
    //         echo?.leave(`direct-message.${user?.id}`);
    //     };
    // }, [echo, selectedChat]);

    return (
        <MyFriendsStyled className="main-content">
            {/* Sidebar */}
            <FriendBar
                friends={friends}
                pending={pendingRequests}
                friendListSearchInputvalue={searchQuery}
                handleSelectedChat={handleSelectChat}
                handlePendingAccept={acceptRequest}
                handlePendingDecline={declineRequest}
                handleFriendListSearchInput={handleSearch}
                selectedChat={selectedChat}
                clearSearch={clearSearch}
                isSearching={isSearching}
                isSearchActive={isSearchActive}
            />
            {/* Chat Content */}
            <Chatbox
                selectedChat={selectedChat}
                messages={messages}
                handleReadMessageRequest={handleReadMessageEvent}
                handleSendDirectMessage={sendDirectMessage}
                chatBoxRef={chatBoxRef}
                handleCloseChatBox={closeChatBox}
            />
        </MyFriendsStyled>
    );
}

const MyFriendsStyled = styled.div`
    display: flex;
    height: 100%;
    border: 1px solid;
    border-radius: 14px;
    min-height: 75vh;

    .friend-bar,
    .chat-box {
        transition: opacity 0.1s ease-in-out;
    }

    @media (max-width: 1023px) {
        .friend-bar.chat-selected {
            opacity: 0;
            width: 0;
            visibility: hidden;
            margin: 0;
            padding: 0;
            transform: scale(0);
        }

        .friend-bar.chat-closed {
            width: 100%;
            opacity: 1;
            border-radius: 14px;
        }

        .chat-box.chat-selected {
            width: 100%;
            opacity: 1;
            border-radius: 14px;

            .chat-header-container {
                border-top-left-radius: 14px;
            }

            .chat-actions-wrapper {
                border-bottom-left-radius: 14px;
            }
        }

        .chat-box.chat-closed {
            opacity: 0;
            width: 0;
            visibility: hidden;
            margin: 0;
            padding: 0;
            transform: scale(0);
        }
    }
`;
