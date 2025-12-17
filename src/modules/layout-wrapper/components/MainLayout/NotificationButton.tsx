"use client";
import React from "react";
import { Badge, IconButton } from "@mui/material";
import { useColorScheme, useMediaQuery, useTheme } from "@mui/material";

import { Bell01Icon } from "@/shared/assets/icons";

interface NotificationButtonProps {
  className?: string;
}
const NotificationButton: React.FC<NotificationButtonProps> = () => {
  const theme = useTheme();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredMode = prefersDarkMode ? "dark" : "light";

  const { mode } = useColorScheme();

  const paletteMode = !mode || mode === "system" ? preferredMode : mode;

  return (
    <IconButton
      sx={{
        backgroundColor: paletteMode === "light" ? theme.palette.grey[200] : "white",
        borderRadius: "0.625rem",
        "&:hover": {
          backgroundColor: "white",
        },
      }}
    >
      <Badge
        badgeContent={4}
        variant="dot"
        color="secondary"
        sx={{
          "& .MuiBadge-dot": {
            marginTop: "4px",
            marginRight: "4px",
            borderRadius: 50,
          },
        }}
      >
        <Bell01Icon className="w-5 h-5" />
      </Badge>
    </IconButton>
  );
};
export default NotificationButton;
