"use client";

import { Input, Typography } from "@material-tailwind/react";
import ChatMessage from "./ChatMessage";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { useEffect, useState } from "react";
import { emoji } from "@/app/utils/icons";
import styled from "styled-components";
import ChatBoxMiniUserProfile from "./ChatBoxMiniUserProfile";
import { useGlobalState } from "@/app/context/globalProvider";
import { sendFriendRequest } from "@/services/api/firendship";
import toast from "react-hot-toast";
import { fetchUserData } from "@/services/api/user";
import { UserInterface } from "@/types/User/User";
import { useFriendship } from "@/app/hooks/friendship";

interface Props {
    messages: {
        message: string;
        from: string;
        chat_name_color: string;
        user_id: number;
    }[];
    handleSendMessage: (message: string) => void;
    handleKeyDown: (e: any) => void;
    chatBoxRef: React.RefObject<HTMLDivElement | null>;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
}

export default function ChatBox({
    messages,
    handleSendMessage,
    handleKeyDown,
    chatBoxRef,
    message,
    setMessage,
}: Props) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [openMiniProfile, setOpenMiniProfile] = useState(false);
    const [miniProfileUserId, setMiniProfileUserId] = useState<number | null>(
        null
    );
    const [miniProfileUserData, setMiniProfileUserData] =
        useState<UserInterface | null>(null);
    const [miniProfileRelativePosition, setMiniProfileRelativePosition] =
        useState<number | null>(null);

    const { theme, user, openMiniChat } = useGlobalState();
    const {
        friends,
        friendById,
        isUserInFriendList,
        selectedChat,
        handleSelectChat,
    } = useFriendship();

    const handleWhisperAction = async (user: UserInterface) => {
        const friend = friendById.get(user.id);
        if (friend) {
            handleSelectChat(friend);
            openMiniChat();
        }
    };

    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    };

    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    const handleSendFriendshipInvite = async (userId: number) => {
        try {
            const { message } = await sendFriendRequest(userId);
            toast.success(message);
        } catch (error: any) {
            toast.error("Failed to send friend request");
        }
    };

    const handleFetchSelectedUserData = async (userId: number) => {
        try {
            const userData = await fetchUserData(userId);
            setMiniProfileUserData(userData);
        } catch (error: any) {
            toast.error("Failed to fetch user data.");
        }
    };

    const handleOpenMiniProfile = (event: any, userId: number) => {
        if (chatBoxRef.current) {
            const containerRect = chatBoxRef.current.getBoundingClientRect();
            const relativeY = event.clientY - containerRect.top;
            setMiniProfileRelativePosition(relativeY);
            setMiniProfileUserId(userId);
            setOpenMiniProfile(true);
        }
    };

    const handleCloseMiniProfile = () => {
        setOpenMiniProfile(false);
        setMiniProfileUserId(null);
        setMiniProfileUserData(null);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (miniProfileUserId) {
            handleFetchSelectedUserData(miniProfileUserId);
        }
    }, [miniProfileUserId]);

    return (
        <ChatBoxStyled theme={theme} className="chat-container">
            <div className="chat-header">
                <Typography variant="h4" className="uppercase text-sm">
                    Live Chat
                </Typography>
            </div>
            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((data, index) => (
                    <ChatMessage
                        key={index + data.from}
                        message={data.message}
                        name={data.from}
                        chatNameColor={data.chat_name_color}
                        userId={data.user_id}
                        handleMiniProfileClick={handleOpenMiniProfile}
                    />
                ))}
                {openMiniProfile && miniProfileUserData !== null && (
                    <ChatBoxMiniUserProfile
                        selectedUser={miniProfileUserData}
                        relativePosition={miniProfileRelativePosition}
                        handleCloseMiniProfile={handleCloseMiniProfile}
                        handleSendFriendshipInvite={handleSendFriendshipInvite}
                        handleWhisper={handleWhisperAction}
                        isUserInFriendList={isUserInFriendList}
                    />
                )}
            </div>
            <div className="chat-input-container">
                {showEmojiPicker && (
                    <Picker
                        onEmojiClick={handleEmojiClick}
                        previewConfig={{
                            showPreview: false,
                            defaultCaption: "",
                        }}
                        className="emoji-picker"
                        width={"90%"}
                    />
                )}
                <div className="chat-input-box">
                    <Input
                        type="text"
                        className="chat-input action-input"
                        id="chat-input"
                        label="Send a message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        crossOrigin={"anonymous"}
                        onKeyDown={handleKeyDown}
                        labelProps={{
                            className: "label-border-color",
                        }}
                    />
                    <button
                        className="chat-input-emoji-picker"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        {emoji}
                    </button>
                </div>
                <button
                    className="btn-primary input-btn"
                    onClick={() => {
                        handleSendMessage(message);
                        setShowEmojiPicker(false);
                    }}
                >
                    <span className="text-sm font-semibold leading-5 flex px-3">
                        Chat
                    </span>
                </button>
            </div>
        </ChatBoxStyled>
    );
}

const ChatBoxStyled = styled.section`
    border: 1px solid #53535f7a;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 500px;
    background-color: ${(props) => props.theme.colorBg3};
    border-radius: 0 0 14px 14px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    position: relative;

    @media (min-width: 1023px) {
        width: 300px;
        border-radius: 0 14px 14px 0;
    }

    .chat-header {
        background-color: ${(props) => props.theme.colorBg2};
        color: ${(props) => props.theme.colorTextPrimary};
        height: 3rem;
        padding-left: 10px;
        padding-right: 10px;
        border-bottom: 1px solid #53535f7a;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chat-box {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .chat-input-container {
        position: relative;
        background-color: ${(props) => props.theme.colorBg2};
        border-top: 1px solid #53535f7a;
        display: flex;
        flex-direction: row;
        padding: 0.5rem;
        gap: 12px;

        .input-btn {
            border-radius: 14px;
            color: ${(props) => props.theme.colorTextSecondary};
        }
    }

    .emoji-picker {
        position: absolute;
        padding-bottom: 1rem;
        bottom: 60px;
        max-height: 350px;
    }

    .message {
        margin-bottom: 10px;
        color: #fff;
        display: flex;
        flex-direction: row;
        overflow-wrap: anywhere;
    }

    .username {
        font-weight: bold;
        color: #3ba55d;
        margin-right: 5px;
    }

    .text {
        word-break: break-word;
        color: #fff;
    }

    .chat-input-box {
        position: relative;
        flex-grow: 1;
    }

    .chat-input-emoji-picker {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        cursor: pointer;
        color: ${(props) => props.theme.colorIcons};
    }

    .chat-input input::placeholder {
        color: #b9bbbe;
    }

    .chat-input button {
        background-color: #3ba55d;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .chat-input button:hover {
        background-color: #2d8649;
    }

    /* Add custom scrollbar for chat-box */
    .chat-box::-webkit-scrollbar {
        width: 8px;
    }

    .chat-box::-webkit-scrollbar-thumb {
        background-color: #40444b;
        border-radius: 5px;
    }
`;
