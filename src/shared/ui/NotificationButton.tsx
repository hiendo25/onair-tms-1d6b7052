"use client";
import { Badge, IconButton } from "@mui/material";
import { Bell01Icon } from "../assets/icons";
import { useColorScheme, useMediaQuery, useTheme } from "@mui/material";

const NotifycationButton = () => {
  const theme = useTheme();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredMode = prefersDarkMode ? "dark" : "light";

  const { mode } = useColorScheme();

  const paletteMode = !mode || mode === "system" ? preferredMode : mode;

  return (
    <IconButton
      sx={{
        backgroundColor: paletteMode === "light" ? "white" : "white",
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
export default NotifycationButton;
