"use client";

import styled from "styled-components";
import { xmarkIcon } from "@/app/utils/icons";
import { useGlobalState } from "@/app/context/globalProvider";
import { UserInterface } from "@/types/User/User";

interface Props {
    selectedUser: UserInterface;
    relativePosition: number | null;
    handleCloseMiniProfile: () => void;
    handleSendFriendshipInvite: (userId: number) => void;
    handleWhisper: (user: UserInterface) => void;
    isUserInFriendList: (userId: number) => boolean;
}

export default function ChatBoxMiniUserProfile({
    selectedUser,
    relativePosition,
    handleCloseMiniProfile,
    handleSendFriendshipInvite,
    handleWhisper,
    isUserInFriendList,
}: Props) {
    const { theme, user } = useGlobalState();

    const isFriend = isUserInFriendList(selectedUser.id);

    return (
        <ChatBoxMiniUserProfileStyled theme={theme} top={relativePosition}>
            <>
                <div className="mini-profile-header">
                    <div className="mini-profile-image">
                        <img
                            className="h-12 w-12 rounded-full object-cover object-center"
                            src={selectedUser?.profile_picture_url}
                            alt="profile picture preview"
                            width={50}
                            height={50}
                        />
                    </div>
                    <div>
                        <div className="mini-profile-name">
                            <span>{selectedUser?.name}</span>
                        </div>
                    </div>
                    <div
                        onClick={handleCloseMiniProfile}
                        className="action-close"
                    >
                        {xmarkIcon}
                    </div>
                </div>
                {user.id !== selectedUser.id && (
                    <div className="mini-profile-actions">
                        {!isFriend && (
                            <div className="mini-profile-action">
                                <button
                                    className="btn-primary actions-button"
                                    onClick={() =>
                                        handleSendFriendshipInvite(
                                            selectedUser.id
                                        )
                                    }
                                >
                                    <span>Add Friend</span>
                                </button>
                            </div>
                        )}
                        {isFriend && (
                            <div className="mini-profile-action">
                                <button
                                    className="btn-primary actions-button"
                                    onClick={() => handleWhisper(selectedUser)}
                                >
                                    <span>Whisper</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </>
        </ChatBoxMiniUserProfileStyled>
    );
}

const ChatBoxMiniUserProfileStyled = styled.div<{ top: number | null }>`
    position: absolute;
    top: ${(props) => props.top}px;
    width: 100%;

    .mini-profile-header {
        display: flex;
        flex-direction: row;
        position: relative;
        padding: 0.5rem 1rem;
        background-color: ${(props) => props.theme.colorBg};
        border-bottom: 1px solid #53535f7a;
        border-top: 1px solid #53535f7a;

        .mini-profile-name {
            align-contet: center;
            margin-left: 0.5rem;
            color: ${(props) => props.theme.colorTextPrimary};
        }

        .action-close {
            position: absolute;
            cursor: pointer;
            top: 0;
            right: 0;
            margin: 0.5rem 1rem;
            color: ${(props) => props.theme.colorIcons};
        }
    }

    .mini-profile-actions {
        background-color: ${(props) => props.theme.colorBg4};
        padding: 0.5rem;
        gap: 8px;
        display: flex;
        border-bottom: 1px solid #53535f7a;

        .actions-button {
            padding: 0.5rem;
            border-radius: 14px;
            color: ${(props) => props.theme.colorTextSecondary};
        }
    }
`;
