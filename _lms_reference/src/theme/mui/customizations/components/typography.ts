import * as React from "react";
import { alpha,Components, Theme } from "@mui/material/styles";

 
export const typographyCustomizations: Components<Theme> = {
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        h1: "h1",
        h2: "h2",
        h3: "h2",
        h4: "h2",
        h5: "h2",
        h6: "h2",
        subtitle1: "h2",
        subtitle2: "h2",
        body1: "p",
        body2: "p",
      },
    },
  },
};
