"use client";
import { alpha, createTheme,Shadows } from "@mui/material/styles";

import { error, grey, info, primary, success, warning } from "./theme-color";
export * from "./primitive/typography";

const defaultTheme = createTheme();

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        lighter: primary["lighter"],
        light: primary["light"],
        main: primary["main"],
        dark: primary["dark"],
        darker: primary["darker"],
        contrastText: "white",
      },
      info: {
        lighter: info["lighter"],
        light: info["light"],
        main: info["main"],
        dark: info["dark"],
        darker: info["darker"],
        contrastText: "white",
      },
      warning: {
        lighter: warning["lighter"],
        light: warning["light"],
        main: warning["main"],
        dark: warning["dark"],
        darker: warning["darker"],
        contrastText: "white",
      },
      error: {
        lighter: error["lighter"],
        light: error["light"],
        main: error["main"],
        dark: error["dark"],
        darker: error["darker"],
        contrastText: "white",
      },
      success: {
        lighter: success["lighter"],
        light: success["light"],
        main: success["main"],
        dark: success["dark"],
        darker: success["darker"],
        contrastText: "white",
      },
      grey: {
        ...grey,
      },
      divider: alpha(grey[500], 0.2),
      background: {
        default: "hsl(0, 0%, 99%)",
        paper: "hsl(220, 35%, 97%)",
      },
      text: {
        primary: grey[800],
        secondary: grey[600],
        warning: warning["main"],
      },
      action: {
        hover: alpha(grey[500], 0.08),
        selected: alpha(grey[500], 0.16),
        focus: alpha(grey[500], 0.24),
      },
      baseShadow:
        "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px",
    },
  },
  dark: {
    palette: {
      primary: {
        contrastText: primary["lighter"],
        light: primary["light"],
        main: primary["main"],
        dark: primary["dark"],
        darker: primary["darker"],
        lighter: primary["lighter"],
      },
      info: {
        contrastText: info["lighter"],
        light: info["light"],
        main: info["main"],
        dark: info["dark"],
        darker: info["darker"],
        lighter: info["lighter"],
      },
      warning: {
        light: warning["light"],
        main: warning["main"],
        dark: warning["dark"],
        darker: warning["darker"],
        lighter: warning["lighter"],
      },
      error: {
        light: error["light"],
        main: error["main"],
        dark: error["dark"],
        darker: error["darker"],
        lighter: error["lighter"],
      },
      success: {
        light: success["light"],
        main: success["main"],
        dark: success["dark"],
        darker: success["darker"],
        lighter: success["lighter"],
      },
      grey: {
        ...grey,
      },
      divider: alpha(grey[700], 0.6),
      background: {
        default: grey[900],
        paper: "hsl(220, 30%, 7%)",
      },
      text: {
        primary: "hsl(0, 0%, 100%)",
        secondary: grey[800],
      },
      action: {
        hover: alpha(grey[600], 0.2),
        selected: alpha(grey[600], 0.3),
      },
      baseShadow:
        "hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px",
    },
  },
};

export const shape = {
  borderRadius: 8,
};

// @ts-ignore-error
const defaultShadows: Shadows = [
  "none",
  "var(--template-palette-baseShadow)",
  ...defaultTheme.shadows.slice(2),
];
export const shadows = defaultShadows;
