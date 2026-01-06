import useSWR from "swr";
import { axios } from "@/app/lib/axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter();
    const params = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const csrf = () => axios.get("/sanctum/csrf-cookie");

    const hasSanctumCookie =
        typeof window !== "undefined" && document.cookie.includes("XSRF-TOKEN");

    const shouldFetchUser = hasSanctumCookie;

    const {
        data: user,
        error,
        mutate,
    } = useSWR(
         "/api/user", 
        () =>
            axios
                .get("/api/user")
                .then((res) => res.data)
                .catch((error) => {
                    if (error.response?.status === 409) {
                        router.push("/verify-email");
                    } else if (error.response?.status === 401) {
                        setIsAuthenticated(false);
                    } else {
                        throw error;
                    }
                }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: false,
        }
    );

    const register = async ({ setErrors, ...props }) => {
        await csrf();

        setErrors([]);

        axios
            .post("/register", props)
            .then(() => {
                setIsAuthenticated(true);
                mutate();
            })
            .catch((error) => {
                if (error.response.status !== 422) throw error;

                setErrors(error.response.data.errors);
            });
    };

    const login = async ({ setErrors, setStatus, ...props }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        return axios
            .post("/login", props)
            .then(async () => {
                setIsAuthenticated(true);
                const user = await mutate();

                return user;
            })
            .catch((error) => {
                if (error.response.status !== 422) throw error;

                setErrors(error.response.data.errors);
            });
    };

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        axios
            .post("/forgot-password", { email })
            .then((response) => setStatus(response.data.status))
            .catch((error) => {
                if (error.response.status !== 422) throw error;

                setErrors(error.response.data.errors);
            });
    };

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        axios
            .post("/reset-password", { token: params.token, ...props })
            .then((response) =>
                router.push("/login?reset=" + btoa(response.data.status))
            )
            .catch((error) => {
                if (error.response.status !== 422) throw error;

                setErrors(error.response.data.errors);
            });
    };

    const resendEmailVerification = ({ setStatus }) => {
        axios
            .post("/email/verification-notification")
            .then((response) => setStatus(response.data.status));
    };

    const logout = async () => {
        try {
            await axios.post("/logout").then(() => {
                mutate(undefined, false);
                setIsAuthenticated(false);
                if (typeof window !== "undefined") {
                    window.location.pathname = "/";
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (middleware === "guest" && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated);
        if (
            typeof window !== "undefined" &&
            window.location.pathname === "/verify-email" &&
            user?.email_verified_at
        )
            router.push(redirectIfAuthenticated);
        if (middleware === "auth" && error) logout();
    }, [user, error]);

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
        isLoggedIn: !!user,
    };
};
