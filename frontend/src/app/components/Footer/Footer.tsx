"use client";

import React from "react";
import Image from "next/image";
import { Typography } from "@material-tailwind/react";
import {
    gitIcon,
    twitterIcon,
    instagramIcon,
    faceBookIcon,
} from "@/app/utils/icons";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";

export default function Footer() {
    const { theme } = useGlobalState();

    const icons = [
        {
            icon: gitIcon,
        },
        {
            icon: twitterIcon,
        },
        {
            icon: instagramIcon,
        },
        {
            icon: faceBookIcon,
        },
    ];

    return (
        <>
            <FooterStyled
                theme={theme}
                className="footer bloc w-full mx-auto mt-4 mb-4 py-4 px-8 container"
            >
                <div className="flex flex-row justify-around mt-4">
                    <div className="flex flex-row items-center">
                        <Image
                            src="/images/home-logo.png"
                            alt="Description of image"
                            width={90}
                            height={90}
                            priority
                        />
                    </div>
                    <div className="flex flex-row items-center">
                        {icons.map(({ icon }, key) => (
                            <Typography
                                key={key}
                                as="a"
                                href="#"
                                variant="small"
                                className="mr-4 text-xl"
                            >
                                {icon}
                            </Typography>
                        ))}
                    </div>
                </div>
                <div className="flex justify-center">
                    <Typography className="mb-4 text-center font-normal  md:mb-0 flex flex-row gap-4">
                        Watch With ❤️
                        <span>All rights reserved.</span>
                    </Typography>
                </div>
            </FooterStyled>
        </>
    );
}

const FooterStyled = styled.footer`
    color: ${(props) => props.theme.colorTextPrimary};
`;