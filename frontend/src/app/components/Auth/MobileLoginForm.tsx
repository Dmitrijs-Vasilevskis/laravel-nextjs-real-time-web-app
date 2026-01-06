"use client";

import { Button, Input } from "@material-tailwind/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/hooks/auth";
import { useGlobalState } from "@/app/context/globalProvider";
import { AuthFormType } from "@/types/Auth/Auth";
import { UserInterface } from "@/types/User/User";
import styled from "styled-components";

interface Props {
  handleFormType: (newFormType: AuthFormType) => void;
}

interface FormData {
    email: string;
    password: string;
}

export default function MobileLoginForm({ handleFormType }: Props) {
    const [shouldRemember, setShouldRemember] = useState(false);
    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState(null);

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });

    const { theme } = useGlobalState();

    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        let isValid = true;

        if (!formData.email) {
            toast.error("Email is required");
            isValid = false;
        }

        if (!formData.password) {
            toast.error("Password is required");
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (validateForm()) {
            login({
                email: formData.email,
                password: formData.password,
                remember: shouldRemember,
                setErrors,
                setStatus,
            }).then((user: UserInterface) => {
                if (user.name) {
                    toast.success("Succsfully logged in");
                }
            });
        }
    };

    return (
        <MobileLoginFormStyled theme={theme} className="w-full h-full flex flex-col">
            <div className="align-center">
                <h3 className="text-2xl font-bold mb-4 text-white ">Login</h3>
            </div>
            <form onSubmit={handleSubmit} className="form-wrapper">
                <div className="flex flex-col gap-3">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Email"
                        name="email"
                        id="mobileEmail"
                        onChange={handleChange}
                        crossOrigin={"anonymous"}
                        className="form-input"
                        labelProps={{
                            className:
                                "label-border-color",
                        }}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Password"
                        autoComplete="off"
                        name="password"
                        id="mobilePassword"
                        onChange={handleChange}
                        crossOrigin={"anonymous"}
                        className="form-input"
                        labelProps={{
                            className:
                                "label-border-color",
                        }}
                    />
                </div>
                <div className="flex flex-col justify-center pt-4">
                    <Button type="submit" color="gray">
                        Sign in
                    </Button>
                    <a
                        onClick={() => handleFormType("register")}
                        className="cursor-pointer text-white text-center mt-2 font-normal text-sm"
                    >
                        <span>Sign up</span>
                    </a>
                    <a
                        onClick={() => handleFormType("forgotPassword")}
                        className="cursor-pointer text-white text-center mt-2 font-normal text-sm"
                    >
                        <span>Forgot your password?</span>
                    </a>
                </div>
            </form>
        </MobileLoginFormStyled>
    );
}

const MobileLoginFormStyled = styled.div`

   
`;