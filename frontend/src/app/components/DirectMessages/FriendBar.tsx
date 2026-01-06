"use client";

import styled from "styled-components";
import {
    FriendInterface,
    FriendPendingInterface,
} from "@/types/User/Firendship";
import { useState } from "react";
import {
    chevronUpIcon,
    chevronDownIcon,
    xmarkIcon,
    checkIcon,
} from "@/app/utils/icons";
import { useGlobalState } from "@/app/context/globalProvider";
import { formatTimeHourMinutes } from "@/app/utils/formatTime";
import SkeletonLoader from "../UI/Loader/Skeleton";
import { useFriendship } from "@/app/hooks/friendship";

interface Props {
    handleSelectedChat: (friend: FriendInterface) => void;
    selectedChat: FriendInterface | null;
    friends: FriendInterface[];
    friendListSearchInputvalue: string;
    pending: FriendPendingInterface[];
    handlePendingAccept: (sender_id: number) => void;
    handlePendingDecline: (sender_id: number) => void;
    handleFriendListSearchInput: (name: string) => void;
    clearSearch: () => void;
    isSearching: boolean;
    isSearchActive: boolean;
}

export default function FriendBar({
    handleSelectedChat,
    selectedChat,
    friends,
    pending,
    friendListSearchInputvalue,
    handlePendingAccept,
    handlePendingDecline,
    handleFriendListSearchInput,
    clearSearch,
    isSearching,
    isSearchActive,
}: Props) {
    const [openPending, setOpenPending] = useState(false);
    const { theme } = useGlobalState();

    const handleopenPending = () => {
        setOpenPending(!openPending);
    };

    return (
        <FriendBarStyled
            theme={theme}
            className={`friend-bar ${
                !!selectedChat ? "chat-selected" : "chat-closed"
            }`}
        >
            <div className="flex flex-col flex-1">
                <div className="relative">
                    <input
                        id="friend-list-searh-input"
                        type="text"
                        placeholder="Search"
                        className="search-input"
                        value={friendListSearchInputvalue}
                        onChange={(e) =>
                            handleFriendListSearchInput(e.target.value)
                        }
                    />
                    {isSearchActive && (
                        <div
                            className="search-input-close-icon"
                            onClick={clearSearch}
                        >
                            {xmarkIcon}
                        </div>
                    )}
                </div>
                <ul className="friend-list">
                    {isSearchActive && friends.length == 0 && (
                        <SkeletonLoader classNames="friend-list-item list-item relative overflow-hidden h-[60px]" />
                    )}
                    {!isSearching &&
                        friends.length > 0 &&
                        friends.map((friend: FriendInterface, index) => (
                            <li
                                onClick={() => handleSelectedChat(friend)}
                                key={index}
                                className={`friend-list-item list-item ${
                                    friend.data.id === selectedChat?.data.id &&
                                    "selected"
                                }`}
                            >
                                <div className="user-avatar-container">
                                    <img
                                        className="user-avatar"
                                        src={friend.data.profile_picture_url}
                                        alt={`${friend.data.name} profile pic`}
                                        width={30}
                                        height={30}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="user-chat-info">
                                    <p className="user-chat-name">
                                        {friend.data.name}
                                    </p>
                                    <p className="chat-latest-message">
                                        {friend.chat?.latestMessage}
                                    </p>
                                </div>
                                <div className="user-chat-notifications">
                                    <p className="chat-latest-message-time">
                                        {friend.chat?.sentTime &&
                                            formatTimeHourMinutes(
                                                friend.chat?.sentTime
                                            )}
                                    </p>
                                    {!!friend.chat?.unreadCount && (
                                        <div className="chat-user-unread">
                                            {friend.chat?.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                </ul>
                <div className="border rounded-lg pending-requests-wrapper">
                    <div
                        onClick={handleopenPending}
                        className="flex flex-row justify-between p-2 cursor-pointer"
                    >
                        <h3>Pending Requests</h3>
                        <span>
                            {openPending ? chevronUpIcon : chevronDownIcon}
                        </span>
                    </div>
                    <div className="pending-requests">
                        <ul
                            className={`pending-requests-list ${
                                openPending ? "expand" : ""
                            }`}
                        >
                            {pending.length > 0 &&
                                pending.map(
                                    (friend: FriendPendingInterface) => (
                                        <li
                                            key={friend.id}
                                            className="pending-request-item list-item"
                                        >
                                            <div className="user-avatar-container">
                                                <img
                                                    className="user-avatar"
                                                    src={
                                                        friend.sender
                                                            .profile_picture_url ||
                                                        ""
                                                    }
                                                    alt={`${friend.sender.name} profile pic`}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="pending-request-item-content">
                                                <p className="user-name">
                                                    {friend.sender.name}
                                                </p>
                                                <div className="actions">
                                                    <button
                                                        onClick={() =>
                                                            handlePendingAccept(
                                                                friend.sender.id
                                                            )
                                                        }
                                                        className="action-btn accept"
                                                    >
                                                        {checkIcon}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handlePendingDecline(
                                                                friend.sender.id
                                                            )
                                                        }
                                                        className="action-btn decline"
                                                    >
                                                        {xmarkIcon}
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                )}
                        </ul>
                    </div>
                </div>
            </div>
        </FriendBarStyled>
    );
}

const FriendBarStyled = styled.aside`
    background-color: ${(props) => props.theme.colorBg};
    border-top-left-radius: 14px;
    border-bottom-left-radius: 14px;
    width: 300px;
    border-right: 1px solid #ddd;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    .search-input {
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        border-radius: 8px;
        border: 1px solid #ddd;
        background-color: ${(props) => props.theme.colorBg2};
    }

    .search-input-close-icon {
        position: absolute;
        top: 0;
        right: 0;
        margin: 11px;
        color: ${(props) => props.theme.colorTextPrimary};
    }

    .user-avatar-container {
        max-width: 40px;
        max-height: 40px;
        width: 100%;
        height: 100%;
        background-color: #ddd;
        border-radius: 50%;
        margin-right: 10px;
    }

    .list-item {
        background-color: ${(props) => props.theme.colorBg3};
        transition: all 0.55s ease-in-out;
    }

    .list-item:hover,
    .selected {
        background-color: ${(props) => props.theme.colorBg3};
        transition: all 0.55s ease-in-out;
        box-shadow: inset 0 0 10px ${(props) => props.theme.colorBg4};
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 50%;
        margin-right: 10px;
    }

    .friend-list {
        flex: 1 1 0;
        list-style-type: none;
        padding: 0;
        overflow: auto;
    }

    .friend-list-item {
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;

        .user-chat-info {
            display: grid;
            font-size: 14px;
            font-weight: 600;

            .chat-latest-message {
                color: #999;
                font-size: 12px;
                font-weight: 400;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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

    .friend-list-item:hover {
    }

    .pending-requests-wrapper {
        color: ${(props) => props.theme.colorTextPrimary};
        background-color: ${(props) => props.theme.colorBg2};
        border: 2px solid ${(props) => props.theme.colorBg3};
    }

    .pending-requests-list {
        max-height: 0;
        overflow: hidden;
        border-bottom-right-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;

        .pending-request-item {
            display: flex;
            flex-direction: row;
            padding: 0.5rem 0.75rem;
            border-top: 1px solid;
            align-items: center;

            .pending-request-item-content {
                display: flex;
                flex-direction: column;
            }

            .user-name {
                font-weight: 600;
                font-size: 1.1rem;
            }

            .actions {
                display: inline-flex;
                gap: 1rem;
            }

            .action-btn {
                border-radius: 50%;
                width: 1.5rem;
                height: 1.5rem;
            }

            .accept {
                background-color: ${(props) => props.theme.colorGreenDark};
            }

            .decline {
                background-color: ${(props) => props.theme.colorDanger};
            }
        }
    }

    .pending-requests-list.expand {
        max-height: 300px;
        transition: max-height 0.3s ease-in;
    }
`;
