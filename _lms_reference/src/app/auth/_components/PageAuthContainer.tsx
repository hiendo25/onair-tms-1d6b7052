"use client";
import React, { PropsWithChildren } from "react";
import { Container, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";

const PageContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  backgroundColor: theme.palette.background.default,
  padding: 0,
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

interface PageAuthContainerProps extends PropsWithChildren {
  className?: string;
}
const PageAuthContainer: React.FC<PageAuthContainerProps> = ({ children, className }) => {
  return (
    <PageContainer className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        <div className="auth-col-left flex items-center">{children}</div>
        <div className="auth-col-right">
          <div className="image relative w-full h-full">
            <Image
              src="/assets/images/auth/auth-background.png"
              alt="Auth Background"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
export default PageAuthContainer;
