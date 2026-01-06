"use client";

import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import Chatbox from "../DirectMessages/Chatbox";
import { useChat } from "@/app/hooks/chat";
import { useFriendship } from "@/app/hooks/friendship";
import { FriendInterface } from "@/types/User/Firendship";

interface Props {
    selectedChat: FriendInterface | null;
    handleSelectChat: (data: FriendInterface | null) => void;
    friends: FriendInterface[];
    handleReadMessageEvent: (messageId: number, senderId: number) => void;
}

export default function MiniChatbox() {
    const { theme } = useGlobalState();

    const {
        messages,
        chatBoxRef,
        sendDirectMessage,
        closeChatBox,
        readMessageRequest,
        handleSelectChat,
        selectedChat,
    } = useChat();

    const { friends, updateUnreadCount } = useFriendship();

    const handleReadMessageEvent = async (
        messageId: number,
        senderId: number
    ) => {
        readMessageRequest(messageId, senderId).then(() => {
            updateUnreadCount(senderId, false);
        });
    };

    return (
        <MiniChatBoxStyled theme={theme} className="flex flex-row h-full">
            <ul className="border-r scroll">
                {friends.map((friend, index) => (
                    <li
                        onClick={() => handleSelectChat(friend)}
                        key={index}
                        className={`friend-list-item list-item ${
                            friend.data.id === selectedChat?.data.id &&
                            "selected"
                        }`}
                    >
                        <div className="user-avatar-container">
                            {!!friend.chat?.unreadCount && (
                                <span className="unread"></span>
                            )}
                            <img
                                className="user-avatar"
                                src={friend.data.profile_picture_url}
                                alt={`${friend.data.name} profile pic`}
                            />
                        </div>
                    </li>
                ))}
            </ul>
            <div className="flex-1 flex">
                <Chatbox
                    selectedChat={selectedChat}
                    messages={messages}
                    handleReadMessageRequest={handleReadMessageEvent}
                    handleSendDirectMessage={sendDirectMessage}
                    chatBoxRef={chatBoxRef}
                    handleCloseChatBox={closeChatBox}
                />
            </div>
        </MiniChatBoxStyled>
    );
}

const MiniChatBoxStyled = styled.div`
    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }

    .user-avatar-container {
        position: relative;
        max-width: 40px;
        max-height: 40px;
        width: 100%;
        height: 100%;
        background-color: #ddd;
        border-radius: 50%;

        .unread {
            background-color: #f00;
            color: #fff;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            position: absolute;
            transform: translate3d(30px, 0, 0);
        }
    }

    .friend-list {
        flex: 1 1 0;
    }

    .list-item:hover,
    .selected {
        background-color: ${(props) => props.theme.colorBg};
        transition: all 0.55s ease-in-out;
        box-shadow: inset 0 0 10px ${(props) => props.theme.colorButtonPrimary};
    }

    .friend-list-item {
        padding: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #eee;

        .user-chat-info {
            font-size: 14px;
            font-weight: 600;

            .chat-latest-message {
                color: #999;
                font-size: 12px;
                font-weight: 400;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                -webkit-line-clamp: 1;
            }
        }

        .user-chat-notifications {
            margin-left: auto;
            text-align: right;
            justify-items: center;
        }

        .chat-latest-message-time {
            font-size: 12px;
            color: #999;
        }

        .chat-user-unread {
            background-color: #f00;
            color: #fff;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
        }
    }
`;
