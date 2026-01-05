"use client";

import { useEffect, useRef, useState } from "react";
import type { TypographyProps } from "@mui/material";
import { Button, Stack, Typography } from "@mui/material";

const DEFAULT_LINE_CLAMP = 2;
const DEFAULT_TEXT_VARIANT: TypographyProps["variant"] = "body2";
const DEFAULT_TEXT_COLOR: TypographyProps["color"] = "text.secondary";
const DEFAULT_TOGGLE_LABELS = {
  collapse: "Thu gọn",
  expand: "Xem thêm",
};
const OVERFLOW_TOLERANCE = 1;

type DescriptionTextProps = Omit<TypographyProps, "children" | "ref" | "component" | "sx">;

export interface ExpandableDescriptionProps {
  text?: string | null;
  fallbackText?: string;
  lineClamp?: number;
  expandLabel?: string;
  collapseLabel?: string;
  textProps?: DescriptionTextProps;
}

export default function ExpandableDescription({
  text,
  fallbackText,
  lineClamp = DEFAULT_LINE_CLAMP,
  expandLabel = DEFAULT_TOGGLE_LABELS.expand,
  collapseLabel = DEFAULT_TOGGLE_LABELS.collapse,
  textProps,
}: ExpandableDescriptionProps) {
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const trimmedText = text?.trim();
  const trimmedFallbackText = fallbackText?.trim();
  const displayText = trimmedText || trimmedFallbackText || "";

  useEffect(() => {
    setIsExpanded(false);
  }, [displayText]);

  useEffect(() => {
    if (!displayText) {
      setIsOverflowing(false);
      return;
    }

    if (!descriptionRef.current || isExpanded) {
      return;
    }

    const element = descriptionRef.current;

    const updateOverflowState = () => {
      if (!descriptionRef.current) {
        return;
      }
      const shouldShowToggle =
        descriptionRef.current.scrollHeight >
        descriptionRef.current.clientHeight + OVERFLOW_TOLERANCE;
      setIsOverflowing(shouldShowToggle);
    };

    updateOverflowState();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateOverflowState());
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [displayText, isExpanded, lineClamp]);

  if (!displayText) {
    return null;
  }

  return (
    <Stack spacing={0.5}>
      <Typography
        ref={descriptionRef}
        component="p"
        variant={DEFAULT_TEXT_VARIANT}
        color={DEFAULT_TEXT_COLOR}
        {...textProps}
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: isExpanded ? "unset" : lineClamp,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {displayText}
      </Typography>
      {isOverflowing ? (
        <Button
          size="small"
          variant="text"
          onClick={() => setIsExpanded((prev) => !prev)}
          sx={{ alignSelf: "flex-start", px: 0, minWidth: "auto" }}
        >
          {isExpanded ? collapseLabel : expandLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
