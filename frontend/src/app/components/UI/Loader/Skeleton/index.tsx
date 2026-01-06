import styled from "styled-components";

interface Props {
    classNames: string;
}

export default function SkeletonLoader({classNames}:Props) {
    return (
        <StyledLoader className={classNames}>
            <div className="skeleton-content">

            </div>
        </StyledLoader>
    );
}
const StyledLoader = styled.div`
    .skeleton-content:before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, .1) 20%,
            rgba(255, 255, 255, 0.3) 45%,
            rgba(255, 255, 255, .1) 80%,
            transparent
        );
        animation: skeletonSlide 1.4s linear infinite;
    }

    @keyframes skeletonSlide {
        from {
            left: -100%;
        }
        to {
            left: 100%;
        }
    }
`;