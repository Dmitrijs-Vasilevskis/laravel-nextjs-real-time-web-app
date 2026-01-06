"use client";
import React, { useEffect } from "react";
import { GlobalProvider } from "../context/globalProvider";
import { Toaster } from "@/app/components/UI/Toaster";
import { FriendshipProvider } from "../context/friendshipContext";

interface Props {
    children: React.ReactNode;
}

export default function ContextProvider({ children }: Props) {
    const [isInitialized, setIsInitialized] = React.useState(false);

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    if (!isInitialized) {
        return null;
    }
    return (
        <GlobalProvider>
            <FriendshipProvider>
                <Toaster />
                {children}
            </FriendshipProvider>
        </GlobalProvider>
    );
}
