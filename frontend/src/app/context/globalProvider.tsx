"use client";

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { useEcho } from "@/app/hooks/echo";
import { useAuth } from "@/app/hooks/auth";
import themes from "@/app/context/themes";
import { UserInterface } from "@/types/User/User";
import Echo from "laravel-echo";
import { usePathname, useSearchParams } from "next/navigation";

interface GlobalContextInterface {
    user: UserInterface;
    openAuthModal: boolean;
    handleOpenAuthModal: () => void;
    echo: Echo | null;
    theme: Record<string, string>;
    selectedTheme: number;
    handleThemeSwitch: () => void;
    miniChatOpen: boolean;
    openMiniChat: () => void;
    toggleMiniChat: () => void;
}

export const GlobalContext = createContext<GlobalContextInterface | undefined>(
    undefined
);
export const GlobalUpdateContext = createContext<undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const echo = useEcho();
    const { user, isLoggedIn } = useAuth();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedTheme, setSelectedTheme] = useState<number>(0);
    const theme = themes[selectedTheme];

    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", selectedTheme === 0 ? "light" : "dark");
    }, [selectedTheme]);

    const handleThemeSwitch = () => {
        setSelectedTheme(Number(!selectedTheme));
    };

    const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);
    const handleOpenAuthModal = () => setOpenAuthModal((cur) => !cur);

    const [miniChatOpen, setMiniChatOpen] = useState<boolean>(false);
    const openMiniChat = () => {
        setMiniChatOpen(true);
    };

    const toggleMiniChat = useCallback(() => {
        setMiniChatOpen((curr) => !curr);
    }, [miniChatOpen]);

    const resetModalStates = useCallback(() => {
        setMiniChatOpen(false);
        setOpenAuthModal(false);
    }, []);

    useEffect(() => {
        console.log(">> resetModalStates");
        resetModalStates();
    }, [pathname, searchParams, resetModalStates]);

    const contextValue: GlobalContextInterface = {
        user,
        openAuthModal,
        handleOpenAuthModal,
        echo,
        theme,
        selectedTheme,
        handleThemeSwitch,
        miniChatOpen,
        openMiniChat,
        toggleMiniChat,
    };

    return (
        <GlobalContext.Provider value={contextValue}>
            <GlobalUpdateContext.Provider value={undefined}>
                {children}
            </GlobalUpdateContext.Provider>
        </GlobalContext.Provider>
    );
};

export const useGlobalState = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error(
            "useGlobalContext must be used within a GlobalProvider"
        );
    }
    return context;
};

export const useGlobalUpdateState = () => useContext(GlobalUpdateContext);
