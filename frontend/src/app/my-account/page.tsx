"use client";

import React, { useEffect, useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import styled from "styled-components";
import { useSearchParams } from "next/navigation";
import MyProfile from "../components/MyAccount/Tabs/Profile/MyProfile";
import MySessions from "../components/MyAccount/Tabs/Sessions/MySessions";
import { useAuth } from "../hooks/auth";
import Link from "next/link";
import MyFriends from "../components/MyAccount/Tabs/Friends/MyFriends";
import { useGlobalState } from "../context/globalProvider";

export default function MyAccountPage() {
    const { user } = useAuth({
        middleware: "auth",
        redirectIfAuthenticated: "/",
    });

    const { theme } = useGlobalState();

    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>("profile");

    const isTabActive = (tab: string) => {
        return !!activeTab.includes(tab);
    };

    const handleRenderTab = () => {
        switch (activeTab) {
            case "profile":
                return <MyProfile />;
            case "sessions":
                return <MySessions />;
            case "friends":
                return <MyFriends />;
            default:
                return <MyProfile />;
        }
    };

    useEffect(() => {
        setActiveTab(searchParams.get("tab") || "profile");
    }, [searchParams.get("tab")]);

    return (
        <MyAccountStyled theme={theme} className="main-container">
            <div className="my-account-header">
                <div>
                    <ul className="inline-grid grid-flow-col tab-wrapper">
                        <li>
                            <Link
                                href={{
                                    pathname: "my-account",
                                    query: { tab: "profile" },
                                }}
                                className={`tab-link ${
                                    isTabActive("profile") ? "active" : ""
                                }`}
                            >
                                <span className="tab-text">My Profile</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={{
                                    pathname: "my-account",
                                    query: { tab: "sessions" },
                                }}
                                className={`tab-link ${
                                    isTabActive("sessions") ? "active" : ""
                                }`}
                            >
                                <span className="tab-text">My Sessions</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={{
                                    pathname: "my-account",
                                    query: { tab: "friends" },
                                }}
                                className={`tab-link ${
                                    isTabActive("friends") ? "active" : ""
                                }`}
                            >
                                <span className="tab-text">My Friends</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            {user && <div className="main-wrapper">{handleRenderTab()}</div>}
        </MyAccountStyled>
    );
}

const MyAccountStyled = styled.div`
    display: flex;
    flex-direction: column;
    color: ${(props) => props.theme.colorTextPrimary};
    padding-bottom: 1rem;

    .main-wrapper {
        width: 100%;
        height: 100%;
    }

    .main-content {
        min-height: 75vh;
    }

    .my-account-header {
        margin: 0 1rem 1rem 1rem;
    }

    .tab-text {
        padding: 0 10px;
    }

    .active {
        color: #bf94ff;
    }

    .tab-link {
        position: relative;
        font-size: 1rem;
        font-weight: 600;
    }

    .tab-link:hover {
        color: #a970ff;
    }

    .tab-link::after {
        position: relative;
        content: "";
        bottom: -2px;
        display: block;
        justify-self: center;
        width: calc(100% - 20px);
        height: 0px;
        background-color: #bf94ff;
    }

    .active::after {
        height: 2px;
    }
`;
