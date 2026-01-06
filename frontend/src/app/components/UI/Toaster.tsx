"use client";

import { Toaster as ParentToaster } from "react-hot-toast";
import { useGlobalState } from "@/app/context/globalProvider";

export const Toaster = () => {
    const { theme } = useGlobalState();

    return (
        <ParentToaster
            toastOptions={{
                success: {
                    style: {
                        backgroundColor: theme.notificationBackgroundColor,
                        color: theme.notificationTextColor,
                    },
                },
                error: {
                    style: {
                        backgroundColor: theme.notificationBackgroundColor,
                        color: theme.notificationTextColor,
                    },
                }
            }}
        />
    )
}