import { Theme, Components } from "@mui/material/styles";
import { tabClasses, tabsClasses } from "@mui/material";
import { grey } from "../../theme-color";
/* eslint-disable import/prefer-default-export */
export const cardsCustomizations: Components<Theme> = {
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        background: "white",
        ...theme.applyStyles("dark", {}),
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        // [".MuiTabs-list"]: {
        //   position: "relative",
        //   zIndex: 10,
        // },
        ...theme.applyStyles("dark", {}),
      }),
    },
  },
};
