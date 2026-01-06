"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { emoji, arrowLeft } from "@/app/utils/icons";
import { FriendInterface } from "@/types/User/Firendship";
import { DirectMessageInterface } from "@/types/DirectMessage/DirectMessage";
import { useGlobalState } from "@/app/context/globalProvider";
import ChatMessage from "./ChatMessage";

interface Props {
    selectedChat: FriendInterface | null;
    messages: DirectMessageInterface[];
    handleReadMessageRequest: (message_id: number, sender_id: number) => void;
    handleSendDirectMessage: (message: string) => void;
    chatBoxRef: React.RefObject<HTMLDivElement>;
    handleCloseChatBox?: () => void;
}


export default function Chatbox({
    selectedChat,
    messages,
    handleReadMessageRequest,
    handleSendDirectMessage,
    chatBoxRef,
    handleCloseChatBox,
}: Props) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [readSenderMessages, setReadSenderMessages] = useState<
        Set<DirectMessageInterface>
    >(new Set());
    const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const lastMessageIdRef = useRef<number | null>(null);
    const hasScrolledToUnread = useRef(false);

    const { user, theme } = useGlobalState();

    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    };

    const scrollToFirstUnreadMessage = () => {
        if (hasScrolledToUnread.current) return;

        const firstUnreadIndex = messages.findIndex(
            (message) => !message.is_read && message.sender_id !== user.id
        );

        if (firstUnreadIndex !== -1 && messageRefs.current[firstUnreadIndex]) {
            messageRefs.current[firstUnreadIndex]?.scrollIntoView({
                behavior: "auto",
                block: "end",
            });
            hasScrolledToUnread.current = true;
        } else {
            scrollToBottom();
        }
    };

    const onSendMessage = async () => {
        if (message) {
            handleSendDirectMessage(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key == "Enter") {
            onSendMessage();
        }
    };

    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        if (messages) {
            const observer = new IntersectionObserver(
                (entries) => {
                    // Detect visible messages on a chatbox viewport and add to a set,
                    // further action, send request and update message is_read state for a sender
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const visible = new Set<DirectMessageInterface>();
                            const index = Number(
                                entry.target.getAttribute("data-index")
                            );
                            const visibleMessage = messages[index];

                            if (
                                visibleMessage &&
                                !visibleMessage.is_read &&
                                visibleMessage.sender_id !== user?.id
                            ) {
                                visible.add(visibleMessage);
                                setReadSenderMessages(visible);
                            }
                        }
                    });
                },
                {
                    root: null,
                    threshold: 0.8,
                }
            );

            messageRefs.current.forEach((ref) => {
                if (ref) observer.observe(ref);
            });

            return () => {
                observer.disconnect();
            };
        }
    }, [messages]);

    useEffect(() => {
        if (readSenderMessages.size > 0) {
            const firstUnread = readSenderMessages.values().next()
                .value as DirectMessageInterface;

            if (firstUnread) {
                const { id, sender_id } = firstUnread;
                handleReadMessageRequest(id, sender_id);
            }
        }
    }, [readSenderMessages]);

    useEffect(() => {
        if (!hasScrolledToUnread.current && messages) {
            // Scroll to the first unread message sent by another user
            scrollToFirstUnreadMessage();
        }
    }, [selectedChat]);

    useEffect(() => {
        if (messages.length === 0) return;

        const last = messages[messages.length - 1];

        if (last.id !== lastMessageIdRef.current && last.sender_id == user.id) {
            scrollToBottom();
        }

        lastMessageIdRef.current = last.id;
    }, [messages]);

    return (
        <ChatboxStyled
            theme={theme}
            className={`chat-box ${
                !!selectedChat ? "chat-selected" : "chat-closed"
            }`}
        >
            {selectedChat ? (
                <div className="chat-container">
                    <div className="chat-header-container">
                        <span
                            className="chat-close-icon"
                            onClick={handleCloseChatBox}
                        >
                            {arrowLeft}
                        </span>
                        <img
                            className="user-avatar"
                            src={selectedChat.data.profile_picture_url}
                            alt={`${selectedChat.data.name} profile pic`}
                        />
                        <h2 style={{ margin: 0 }}>{selectedChat.data.name}</h2>
                    </div>

                    <div className="messages-wrapper" ref={chatBoxRef}>
                        {messages.map(
                            (message: DirectMessageInterface, index) => (
                                <ChatMessage
                                    key={index}
                                    index={index}
                                    messageRefs={messageRefs}
                                    selectedChat={selectedChat}
                                    message={message}
                                />
                            )
                        )}
                    </div>

                    <div className="chat-actions-wrapper">
                        <div className="chat-input-container">
                            {showEmojiPicker && (
                                <Picker
                                    onEmojiClick={handleEmojiClick}
                                    previewConfig={{
                                        showPreview: false,
                                        defaultCaption: "",
                                    }}
                                    className="emoji-picker"
                                />
                            )}
                            <input
                                className="chat-input"
                                type="text"
                                placeholder="Write a message..."
                                value={message}
                                onKeyDown={(e) => handleKeyDown(e)}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button
                                className="chat-input-emoji-picker"
                                onClick={(e) =>
                                    setShowEmojiPicker(!showEmojiPicker)
                                }
                            >
                                {emoji}
                            </button>
                        </div>
                        <button
                            onClick={onSendMessage}
                            className="btn-primary input-btn"
                        >
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="chat-empty">
                    <span className="chat-empty-text">
                        Select a chat to start messaging
                    </span>
                </div>
            )}
        </ChatboxStyled>
    );
}

const ChatboxStyled = styled.section`
    flex: 1 1 0%;
    display: flex;
    flex-direction: column;
    background-color: ${(props) => props.theme.colorBg2};
    border-top-right-radius: 14px;
    border-bottom-right-radius: 14px;

    .chat-container {
        flex: 1 1 0%;
        display: flex;
        flex-direction: column;

        .chat-header-container {
            position: relative;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            border-top-right-radius: 14px;
            background-color: ${(props) => props.theme.colorBg};
            display: flex;
            align-items: center;
            gap: 1rem;

            .chat-close-icon {
                cursor: pointer;
                position: absolute;
                right: 0;
                top: 0;
                transform: translate3d(-15px, 15px, 15px);
            }

            .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }
        }

        .messages-wrapper {
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex: 1;
            flex-direction: column;
            flex-basis: 0;
            gap: 10px;
        }

        .chat-actions-wrapper {
            padding: .5rem 1rem;
            border-top: 1px solid #ddd;
            border-bottom-right-radius: 14px;
            background-color: ${(props) => props.theme.colorBg};
            display: flex;
            gap: 10px;
            align-items: center;

            .chat-input-container {
                position: relative;
                display: flex;
                flex: 1;
            }

            .chat-input-emoji-picker {
                cursor: pointer;
                position: absolute;
                left: 0;
                align-self: center;
                margin-left: 1rem;
            }

            .chat-input {
                flex: 1;
                padding: 0.5rem 0.5rem 0.5rem 2.5rem;
                border-radius: 14px;
                border: 1px solid #ddd;
                background-color: transparent;
            }

            .input-btn {
                padding: 0.5rem 1rem;
                border-radius: 14px;
                border: none;
                color: #fff;
                cursor: pointer;
            }
        }

        .emoji-picker {
            position: absolute;
            padding-bottom: 1rem;
            transform: translateY(-100%);
        }
    }

    .chat-empty {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;

        .chat-empty-text {
            background-color: ${(props) => props.theme.colorBg3};
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
        }
    }
`;
