"use client";
import React, { useMemo } from "react";
import { Alert, SxProps, Theme } from "@mui/material";
import { SnackbarProvider as NotiSnackbarProvider } from "notistack";
export default function SnackbarProvider({ children }: { readonly children: React.ReactNode }) {
  const baseSx = useMemo((): SxProps<Theme> => {
    return (theme) => ({
      backgroundColor: "white",
      color: theme.palette.grey[800],
      width: 320,
      boxShadow: "0px 2px 3px -1px rgb(0,0,0,0.1), 0px 3px 6px -6px rgb(0,0,0,0.2)",

      fontWeight: 500,
      ".MuiAlert-message": {
        flex: 1,
      },

      // ".MuiAlert-icon": {
      //   width: 40,
      //   height: 40,
      //   display: "flex",
      //   alignItems: "center",
      //   justifyContent: "center",
      //   borderRadius: 1,
      // },
      // "&.MuiAlert-colorSuccess": {
      //   ".MuiAlert-icon": {
      //     background: theme.palette.success["lighter"],
      //   },
      // },
      // "&.MuiAlert-colorWarning": {
      //   ".MuiAlert-icon": {
      //     background: theme.palette.warning["lighter"],
      //   },
      // },
      // "&.MuiAlert-colorError": {
      //   ".MuiAlert-icon": {
      //     background: theme.palette.error["lighter"],
      //   },
      // },
      // "&.MuiAlert-colorInfo": {
      //   ".MuiAlert-icon": {
      //     background: theme.palette.primary["lighter"],
      //   },
      // },
    });
  }, []);
  return (
    <NotiSnackbarProvider
      maxSnack={6}
      autoHideDuration={2000}
      anchorOrigin={{
        horizontal: "center",
        vertical: "top",
      }}
      dense
      TransitionProps={{
        direction: "down",
        unmountOnExit: true,
      }}
      Components={{
        error: ({ persist, message, ...props }) => {
          return (
            <Alert ref={props.ref} severity="error" sx={baseSx}>
              {message}
            </Alert>
          );
        },
        success: ({ persist, message, anchorOrigin, ...props }) => {
          return (
            <Alert ref={props.ref} severity="success" sx={baseSx}>
              {message}
            </Alert>
          );
        },
        info: ({ persist, message, anchorOrigin, ...props }) => {
          return (
            <Alert ref={props.ref} severity="info" sx={baseSx}>
              {message}
            </Alert>
          );
        },
        warning: ({ persist, message, anchorOrigin, ...props }) => {
          return (
            <Alert ref={props.ref} severity="warning" sx={baseSx}>
              {message}
            </Alert>
          );
        },
      }}
    >
      {children}
    </NotiSnackbarProvider>
  );
}
