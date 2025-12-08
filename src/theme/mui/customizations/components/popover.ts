import * as React from "react";
import { Components, Theme, alpha } from "@mui/material/styles";

 
export const popoverCustomizations: Components<Theme> = {
  MuiPopover: {
    defaultProps: {},

    styleOverrides: {
      root: {},
      paper: () => ({
        backgroundColor: "white",
        boxShadow: "0px 4px 8px -4px rgb(0 0 0 / 10%), 0px 6px 12px -4px rgb(0 0 0 / 10%)",
      }),
    },
  },
};
