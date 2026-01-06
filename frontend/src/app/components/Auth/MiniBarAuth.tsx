"use client";

import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import { AuthFormType } from "@/types/Auth/Auth";
import { useState } from "react";
import MobileLoginForm from "./MobileLoginForm";
import MobileRegistrationForm from "./MobileRegistrationForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function MiniBarAuth() {
    const [formType, setFormType] = useState<AuthFormType>("login");
    const { theme } = useGlobalState();

     const handleFormType = (newFormType: AuthFormType) => {
            setFormType(newFormType);
     };
    
    const formComponents: Record<AuthFormType, JSX.Element> = {
            login: <MobileLoginForm handleFormType={handleFormType} />,
            register: <MobileRegistrationForm handleFormType={handleFormType} />,
            forgotPassword: <ForgotPasswordForm handleFormType={handleFormType} />,
        };

    return (
        <MiniBarAuthStyled theme={theme}>
             {formComponents[formType]}
        </MiniBarAuthStyled>
    );
}

const MiniBarAuthStyled = styled.div`
    padding: 0 1rem;
    margin: 1rem;

    h3,a,p {
        color: ${(props) => props.theme.colorTextPrimary};
    }

    button {
        background-color: ${(props) => props.theme.colorButtonPrimary};
    }

    button:hover {
        background-color: ${(props) => props.theme.colorButtonPrimaryHover};
    }

    .form-wrapper {
        .peer:focus ~ label.label-border-color::before,
        .peer:focus ~ label.label-border-color::after {
            border-color: ${(props) => props.theme.colorTextPrimary} !important;
        }

        .peer:focus {
            border-left-color: ${(props) => props.theme.colorTextPrimary} !important;
            border-right-color: ${(props) => props.theme.colorTextPrimary} !important;
            border-bottom-color: ${(props) => props.theme.colorTextPrimary} !important;
            transition: border-color 0.2s ease;
        }

        .peer:focus ~ label.label-border-color {
            color: ${(props) => props.theme.colorTextPrimary} !important;
        }
    }
`;