"use client";

import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useMemo, useState, type JSX } from "react";
import styled from "styled-components";
import { AuthFormType } from "@/types/Auth/Auth";
import { useGlobalState } from "@/app/context/globalProvider";

interface Props {
    handleOpenAuthModal: () => void;
    preselectedFormType: AuthFormType | null;
}

export default function AuthModal({
    handleOpenAuthModal,
    preselectedFormType,
}: Props) {
    const [formType, setFormType] = useState<AuthFormType>("login");
    const { theme } = useGlobalState();

    useMemo(() => {
        if (preselectedFormType) {
            setFormType(preselectedFormType);
        }
    }, [preselectedFormType]);

    const handleFormType = (newFormType: AuthFormType) => {
        setFormType(newFormType);
    };

    const formComponents: Record<AuthFormType, JSX.Element> = {
        login: <LoginForm handleFormType={handleFormType} />,
        register: <RegistrationForm handleFormType={handleFormType} />,
        forgotPassword: <ForgotPasswordForm handleFormType={handleFormType} />,
    };

    return (
        <ModalStyled theme={theme}>
            <div className="modal-overlay" onClick={handleOpenAuthModal}></div>
            <div className="absolute -ml-40 -mt-40 w-80 h-auto p-4 left-1/2 top-1/2 border border-gray-600 rounded-lg bg-gray-700">
                {formComponents[formType]}
            </div>
        </ModalStyled>
    );
}

const ModalStyled = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.45);
        filter: blur(4px);
    }

    .form-wrapper {
        .form-input {
            color: ${(props) => props.theme.colorTextLight} !important;

            &::placeholder {
                color: ${(props) => props.theme.colorTextLight} !important;
            }
        }

        .form-input:focus {
            &::placeholder {
                opacity: 0.7;
            }
        }

        label.label-border-color {
            color: ${(props) => props.theme.colorTextLight} !important;
        }

        .peer:focus ~ label.label-border-color,
        .peer:not(:placeholder-shown) ~ label.label-border-color {
            color: ${(props) => props.theme.colorTextLight} !important;
        }

        .peer:focus ~ label.label-border-color::before,
        .peer:focus ~ label.label-border-color::after {
            border-color: ${(props) => props.theme.inputBorderColor} !important;
        }

        .peer:focus {
            border-left-color: ${(props) =>
                props.theme.inputBorderColor} !important;
            border-right-color: ${(props) =>
                props.theme.inputBorderColor} !important;
            border-bottom-color: ${(props) =>
                props.theme.inputBorderColor} !important;
            transition: border-color 0.2s ease;
        }

        .peer:focus ~ label.label-border-color {
            color: ${(props) => props.theme.colorTextLight} !important;
        }
    }
`;
