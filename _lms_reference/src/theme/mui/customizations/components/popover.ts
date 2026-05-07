import * as React from "react";
import { alpha, Components, Theme } from "@mui/material/styles";

export const popoverCustomizations: Components<Theme> = {
  MuiPopover: {
    defaultProps: {},
    styleOverrides: {
      root: {},
      paper: ({ theme }) => ({
        backgroundColor: "white",
        border: `1px solid ${theme.palette.grey[300]}`,
        boxShadow: "rgba(0, 0, 0, 0.16) 0px 4px 8px -4px, rgba(0, 0, 0, 0.08) 0px 6px 12px -6px",
      }),
    },
  },
};
