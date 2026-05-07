"use client";
import React, { memo } from "react";
import { Badge, IconButton, IconButtonProps } from "@mui/material";
import { useColorScheme, useMediaQuery } from "@mui/material";

import { Bell01Icon } from "@/shared/assets/icons";

interface BellButtonProps extends IconButtonProps {
  className?: string;
  count?: number;
}
const BellButton: React.FC<BellButtonProps> = ({ className, count = 0, ...restProps }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredMode = prefersDarkMode ? "dark" : "light";
  const { mode } = useColorScheme();
  const paletteMode = !mode || mode === "system" ? preferredMode : mode;
  return (
    <IconButton
      {...restProps}
      sx={(theme) => ({
        backgroundColor: paletteMode === "light" ? "white" : theme.palette.grey[800],
        width: 36,
        height: 36,
        borderRadius: 36,
        "&:hover": {
          backgroundColor: theme.palette.grey[200],
        },
      })}
      className={className}
    >
      <Badge
        badgeContent={count}
        // variant="dot"
        color="primary"
        slotProps={{
          badge: {
            sx: (theme) => ({
              borderRadius: 50,
              fontSize: 8,
              height: 18,
              minWidth: 18,
            }),
          },
        }}
      >
        <Bell01Icon className="w-5 h-5" />
      </Badge>
    </IconButton>
  );
};
export default memo(BellButton);
