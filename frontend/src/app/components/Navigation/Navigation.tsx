"use client";

import React, { useEffect, useState } from "react";
import { Typography, Button, IconButton } from "@material-tailwind/react";
import AuthModal from "../Auth/AuthModal";
import { useGlobalState } from "@/app/context/globalProvider";
import UserMenu from "../User/UserMenu";
import UserMenuMobile from "../User/UserMenuMobile";
import MiniBarAuth from "../Auth/MiniBarAuth";
import { AuthFormType } from "@/types/Auth/Auth";
import Link from "next/link";
import styled from "styled-components";
import { xmarkIcon } from "@/app/utils/icons";

export default function Navigation() {
    const { openAuthModal, handleOpenAuthModal, user, theme } =
        useGlobalState();
    const [preselectedFormType, setPreselectedFormType] =
        useState<AuthFormType | null>(null);
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const handleOpenMobileMenu = () => setOpenMobileMenu((cur) => !cur);

    useEffect(() => {
        window.addEventListener(
            "resize",
            () => window.innerWidth >= 960 && setOpenMobileMenu(false)
        );
    }, []);

    useEffect(() => {
        if (openMobileMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [openMobileMenu]);

    return (
        <NavigationStyled
            theme={theme}
            className="mx-auto max-w-screen-xl py-0 px-0 md:px-8 md:py-4 w-full"
        >
            <div className="px-4 pt-4 md:px-0 container mx-auto flex items-center justify-between">
                <div className="navigation-left">
                    <Link
                        href={{
                            pathname: "/",
                        }}
                    >
                        <Typography className="mr-4 cursor-pointer text-lg font-bold">
                            Watch W
                        </Typography>
                    </Link>
                </div>
                <div className="navigation-right hidden invisible lg:visible lg:block">
                    {!user ? (
                        <Button
                            onClick={() => {
                                setPreselectedFormType("login");
                                handleOpenAuthModal();
                            }}
                            className="hidden lg:inline-block btn-primary"
                        >
                            Sign in
                        </Button>
                    ) : (
                        <div className="user-profile relative">
                            <UserMenu user={user} />
                        </div>
                    )}
                </div>
                <IconButton
                    size="sm"
                    variant="text"
                    onClick={handleOpenMobileMenu}
                    color="white"
                    className="mobile-menu-btn ml-auto inline-block dark:text-white text-blue-gray-900 lg:hidden"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </IconButton>
            </div>
            {openMobileMenu && (
                <div className="mobile-menu fixed inset-0 z-50 flex flex-col">
                    <div className="mx-auto max-w-screen-xl py-0 px-0 md:px-8 md:py-4 w-full">
                        <div className="px-4 pt-4 md:px-0 container mx-auto flex items-center justify-end">
                            <IconButton
                                size="sm" 
                                variant="text"
                                onClick={handleOpenMobileMenu}
                                color="white"
                                aria-label="Close menu"
                                className="mobile-menu-btn"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </IconButton>
                        </div>
                    </div>
                    {!user ? (
                        <div className="">
                            <MiniBarAuth />
                        </div>
                    ) : (
                        <div className="user-profile relative">
                            <UserMenuMobile handleOpenMobileMenu={handleOpenMobileMenu} user={user} />
                        </div>
                    )}
                </div>
            )}
            {openAuthModal && (
                <AuthModal
                    preselectedFormType={preselectedFormType}
                    handleOpenAuthModal={handleOpenAuthModal}
                />
            )}
        </NavigationStyled>
    );
}

const NavigationStyled = styled.nav`
    color: ${(props) => props.theme.colorTextPrimary};

    .mobile-menu {
        background-color: ${(props) => props.theme.colorBg2};
        color: ${(props) => props.theme.colorTextPrimary};
    }

    .mobile-menu-btn {
        color: ${(props) => props.theme.colorIcons};
    }
`;
