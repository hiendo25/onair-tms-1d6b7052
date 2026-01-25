import * as React from "react";
import { buttonBaseClasses } from "@mui/material/ButtonBase";
import { dividerClasses } from "@mui/material/Divider";
import { menuItemClasses } from "@mui/material/MenuItem";
import { alpha,Components, Theme } from "@mui/material/styles";
import { tabClasses } from "@mui/material/Tab";

import { grey, primary } from "../../theme-color";
 
export const navigationCustomizations: Components<Theme> = {
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: (theme.vars || theme).shape.borderRadius,
        padding: "6px 8px",
        [`&.${menuItemClasses.focusVisible}`]: {
          backgroundColor: "transparent",
        },
        [`&.${menuItemClasses.selected}`]: {
          [`&.${menuItemClasses.focusVisible}`]: {
            backgroundColor: alpha(theme.palette.action.selected, 0.3),
          },
        },
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      list: {
        gap: "0px",
        [`&.${dividerClasses.root}`]: {
          margin: "0 -8px",
        },
      },
      paper: ({ theme }) => ({
        marginTop: "4px",
        borderRadius: (theme.vars || theme).shape.borderRadius,
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        backgroundImage: "none",
        background: "hsl(0, 0%, 100%)",
        boxShadow: "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px",
        [`& .${buttonBaseClasses.root}`]: {
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.action.selected, 0.3),
          },
        },
        ...theme.applyStyles("dark", {
          background: grey[900],
          boxShadow: "hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px",
        }),
      }),
    },
  },

  MuiLink: {
    defaultProps: {
      underline: "none",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.text.primary,
        fontWeight: 500,
        position: "relative",
        textDecoration: "none",
        width: "fit-content",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "1px",
          bottom: 0,
          left: 0,
          backgroundColor: (theme.vars || theme).palette.text.secondary,
          opacity: 0.3,
          transition: "width 0.3s ease, opacity 0.3s ease",
        },
        "&:hover::before": {
          width: 0,
        },
        "&:focus-visible": {
          outline: `3px solid ${alpha(primary["main"], 0.5)}`,
          outlineOffset: "4px",
          borderRadius: "2px",
        },
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.background.default,
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: "fit-content" },
      indicator: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.grey[800],
        ...theme.applyStyles("dark", {
          backgroundColor: (theme.vars || theme).palette.grey[200],
        }),
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: "6px 8px",
        marginBottom: "8px",
        textTransform: "none",
        minWidth: "fit-content",
        minHeight: "fit-content",
        color: (theme.vars || theme).palette.text.secondary,
        borderRadius: (theme.vars || theme).shape.borderRadius,
        border: "1px solid",
        borderColor: "transparent",
        ":hover": {
          color: (theme.vars || theme).palette.text.primary,
          backgroundColor: grey[100],
          borderColor: grey[200],
        },
        [`&.${tabClasses.selected}`]: {
          color: grey[900],
        },
        ...theme.applyStyles("dark", {
          ":hover": {
            color: (theme.vars || theme).palette.text.primary,
            backgroundColor: grey[800],
            borderColor: grey[700],
          },
          [`&.${tabClasses.selected}`]: {
            color: "#fff",
          },
        }),
      }),
    },
  },
  MuiStepConnector: {
    styleOverrides: {
      line: ({ theme }) => ({
        borderTop: "1px solid",
        borderColor: (theme.vars || theme).palette.divider,
        flex: 1,
        borderRadius: "99px",
      }),
    },
  },
  MuiStepIcon: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: "transparent",
        border: `1px solid ${grey[400]}`,
        width: 12,
        height: 12,
        borderRadius: "50%",
        "& text": {
          display: "none",
        },
        "&.Mui-active": {
          border: "none",
          color: (theme.vars || theme).palette.primary.main,
        },
        "&.Mui-completed": {
          border: "none",
          color: (theme.vars || theme).palette.success.main,
        },
        ...theme.applyStyles("dark", {
          border: `1px solid ${grey[700]}`,
          "&.Mui-active": {
            border: "none",
            color: (theme.vars || theme).palette.primary.light,
          },
          "&.Mui-completed": {
            border: "none",
            color: (theme.vars || theme).palette.success.light,
          },
        }),
        variants: [
          {
            props: { completed: true },
            style: {
              width: 12,
              height: 12,
            },
          },
        ],
      }),
    },
  },
  MuiStepLabel: {
    styleOverrides: {
      label: ({ theme }) => ({
        "&.Mui-completed": {
          opacity: 0.6,
          ...theme.applyStyles("dark", { opacity: 0.5 }),
        },
      }),
    },
  },
};
