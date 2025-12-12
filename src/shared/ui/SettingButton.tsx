"use client";
import { IconButton } from "@mui/material";
import { Setting02Icon } from "../assets/icons";
import { useColorScheme, useMediaQuery, useTheme } from "@mui/material";
const SettingButton = () => {
  const theme = useTheme();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredMode = prefersDarkMode ? "dark" : "light";

  const { mode } = useColorScheme();

  const paletteMode = !mode || mode === "system" ? preferredMode : mode;

  return (
    <IconButton
      sx={(theme) => ({
        backgroundColor: paletteMode === "dark" ? "white" : "white",
        borderRadius: "0.625rem",
        "&:hover": {
          backgroundColor: "white",
        },
      })}
    >
      <Setting02Icon className="w-5 h-5" />
    </IconButton>
  );
};
export default SettingButton;
