"use client";
import React, { useState } from "react";
import { Divider, IconButton, Popover, Typography } from "@mui/material";
import { useColorScheme, useMediaQuery, useTheme } from "@mui/material";

import InstallNotificationPrompt from "@/modules/notifications/components/InstallNotificationPrompt";
import PushNotificationManager from "@/modules/notifications/container/PushNotificationManager";
import { Setting02Icon } from "@/shared/assets/icons";
const SettingButton = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredMode = prefersDarkMode ? "dark" : "light";

  const { mode } = useColorScheme();

  const paletteMode = !mode || mode === "system" ? preferredMode : mode;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopOver = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "setting-popover" : undefined;

  return (
    <div>
      <IconButton
        sx={(theme) => ({
          backgroundColor: paletteMode === "dark" ? "white" : "white",
          borderRadius: "36px",
          "&:hover": {
            backgroundColor: theme.palette.grey[200],
          },
        })}
        onClick={handleOpenPopOver}
      >
        <Setting02Icon className="w-5 h-5" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <div className="p-3 w-60">
          <PushNotificationManager />
          <Divider className="my-3" />
          <InstallNotificationPrompt />
        </div>
      </Popover>
    </div>
  );
};
export default SettingButton;
