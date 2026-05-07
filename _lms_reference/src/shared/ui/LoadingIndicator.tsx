"use client";

import React from "react";
import { keyframes, styled } from "@mui/material";
import { useLinkStatus } from "next/link";

import { cn } from "@/utils";

interface LoadingIndicatorProps {
  className?: string;
}
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ className }) => {
  const { pending } = useLinkStatus();
  return (
    <LoadingItem
      aria-hidden
      className={cn(
        "link-hint",
        {
          "is-pending": pending,
        },
        className,
      )}
    />
  );
};
export default LoadingIndicator;
const fadeIn = keyframes`
  to {
    opacity: 0.35;
  }
`;

const pulse = keyframes`
  50% {
    opacity: 0.15;
  }
`;

const LoadingItem = styled("span")((theme) => ({
  display: "inline-block",
  width: " 0.6em",
  height: " 0.6em",
  marginLeft: "0.25rem",
  borderRadius: "9999px",
  background: "currentColor",
  opacity: 0,
  visibility: "hidden",

  "&.is-pending": {
    visibility: "visible",
    animationName: `${fadeIn}, ${pulse}`,
    animationDuration: "200ms, 1s",
    /* Appear only if navigation actually takes time */
    animationDelay: "100ms, 100ms",
    animationTimingFunction: "ease, ease-in-out",
    animationIterationCount: "1, infinite",
    animationFillMode: "forwards, none",
  },
}));
