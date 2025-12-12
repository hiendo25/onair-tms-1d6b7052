import * as React from "react";
import { Components, Theme, alpha } from "@mui/material/styles";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import { error, grey, info, primary, secondary, success, warning } from "../../theme-color";

 
export const checkboxCustomizations: Components<Theme> = {
  MuiCheckbox: {
    defaultProps: {
      // disableRipple: true,
      icon: <CheckBoxOutlineBlankRoundedIcon sx={{ color: "hsla(210, 0%, 0%, 0.0)" }} />,
      checkedIcon: <CheckRoundedIcon sx={{ height: 14, width: 14 }} />,
      indeterminateIcon: <RemoveRoundedIcon sx={{ height: 14, width: 14 }} />,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        margin: "0.5rem",
        height: "1.125rem",
        width: "1.125rem",
        borderRadius: "0.375rem",
        border: "2px solid",
        padding: "8px",
        borderColor: theme.palette.grey[400],
        transition: "border-color, background-color, 120ms ease-in",
        // ...theme.applyStyles("dark", {
        //   borderColor: alpha(gray[700], 0.8),
        //   boxShadow: "0 0 0 1.5px hsl(210, 0%, 0%) inset",
        //   backgroundColor: alpha(gray[900], 0.8),
        //   "&:hover": {
        //     borderColor: brand[300],
        //   },
        //   "&.Mui-focusVisible": {
        //     borderColor: brand[400],
        //     outline: `3px solid ${alpha(brand[500], 0.5)}`,
        //     outlineOffset: "2px",
        //   },
        // }),
        variants: [
          {
            props: {
              color: "primary",
            },
            style: {
              color: primary["main"],
              "&:hover": {
                borderColor: primary["main"],
              },
              "&.Mui-checked": {
                color: "white",
                backgroundColor: primary["main"],
                borderColor: primary["main"],
                boxShadow: `none`,
                "&:hover": {
                  backgroundColor: primary["main"],
                  borderColor: primary["main"],
                },
              },
            },
          },
          {
            props: {
              color: "secondary",
            },
            style: {
              color: secondary["main"],
              "&:hover": {
                borderColor: secondary["main"],
              },
              "&.Mui-checked": {
                color: "white",
                backgroundColor: secondary["main"],
                borderColor: secondary["main"],
                boxShadow: `none`,
                "&:hover": {
                  backgroundColor: secondary["main"],
                  borderColor: secondary["main"],
                },
              },
            },
          },
          {
            props: {
              color: "success",
            },
            style: {
              color: success["main"],
              "&:hover": {
                borderColor: success["main"],
              },
              "&.Mui-checked": {
                color: "white",
                backgroundColor: success["main"],
                borderColor: success["main"],
                boxShadow: `none`,
                "&:hover": {
                  backgroundColor: success["main"],
                  borderColor: success["main"],
                },
              },
            },
          },
          {
            props: {
              color: "warning",
            },
            style: {
              color: warning["main"],
              "&:hover": {
                borderColor: warning["main"],
              },
              "&.Mui-checked": {
                color: "white",
                backgroundColor: warning["main"],
                borderColor: warning["main"],
                boxShadow: `none`,
                "&:hover": {
                  backgroundColor: warning["main"],
                  borderColor: warning["main"],
                },
              },
            },
          },
          {
            props: {
              color: "info",
            },
            style: {
              color: info["main"],
              "&:hover": {
                borderColor: info["main"],
              },
              "&.Mui-checked": {
                color: "white",
                backgroundColor: info["main"],
                borderColor: info["main"],
                boxShadow: `none`,
                "&:hover": {
                  backgroundColor: info["main"],
                  borderColor: info["main"],
                },
              },
            },
          },
          {
            props: {
              color: "error",
            },
            style: {
              color: error["main"],
              "&:hover": {
                borderColor: error["main"],
              },
              "&.Mui-checked": {
                color: "white",
                backgroundColor: error["main"],
                borderColor: error["main"],
                boxShadow: `none`,
                "&:hover": {
                  backgroundColor: error["main"],
                  borderColor: error["main"],
                },
              },
            },
          },
          {
            props: {
              color: "default",
            },
            style: {
              color: "white",
              "&:hover": {
                borderColor: grey[800],
              },
              "&.Mui-checked": {
                color: "white",
                backgroundColor: grey[800],
                borderColor: grey[800],
                boxShadow: `none`,
                "&:hover": {
                  backgroundColor: grey[800],
                  borderColor: grey[800],
                },
              },
            },
          },
          {
            props: {
              size: "small",
            },
            style: {
              // margin: "0.2rem",
              height: "1rem",
              width: "1rem",
              borderRadius: "0.325rem",
              padding: "7px",
            },
          },
        ],
      }),
    },
  },
  MuiRadio: {
    defaultProps: {
      color: "primary",
      disableRipple: false,
      // icon: (
      //   <CheckBoxOutlineBlankRoundedIcon
      //     sx={{ color: "hsla(210, 0%, 0%, 0.0)" }}
      //   />
      // ),
      // checkedIcon: <CheckRoundedIcon sx={{ height: 14, width: 14 }} />,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        margin: 10,
        height: "1.125rem",
        width: "1.125rem",
        borderRadius: "1.125rem",
        // border: "1px solid ",
        // borderColor: alpha(theme.palette.grey[400], 1),
        color: theme.palette.grey[400],
        boxShadow: "0 0 0 1.5px hsla(210, 0%, 0%, 0.04) inset",
        backgroundColor: alpha(grey[100], 1),
        transition: "border-color, background-color, 120ms ease-in",
        variants: [
          {
            props: {
              color: "primary",
            },
            style: {
              "&:hover": {
                borderColor: primary["main"],
              },
              "&.Mui-checked": {
                color: primary["main"],
                "&:hover": {
                  color: primary["main"],
                },
              },
            },
          },
          {
            props: {
              color: "secondary",
            },
            style: {
              "&:hover": {
                borderColor: secondary["main"],
              },
              "&.Mui-checked": {
                color: secondary["main"],
                "&:hover": {
                  color: secondary["main"],
                },
              },
            },
          },
          {
            props: {
              color: "success",
            },
            style: {
              "&:hover": {
                borderColor: success["main"],
              },
              "&.Mui-checked": {
                color: success["main"],
                "&:hover": {
                  color: success["main"],
                },
              },
            },
          },
          {
            props: {
              color: "warning",
            },
            style: {
              "&:hover": {
                borderColor: warning["main"],
              },
              "&.Mui-checked": {
                color: warning["main"],
                "&:hover": {
                  color: warning["main"],
                },
              },
            },
          },
          {
            props: {
              color: "error",
            },
            style: {
              "&:hover": {
                borderColor: error["main"],
              },
              "&.Mui-checked": {
                color: error["main"],
                "&:hover": {
                  color: error["main"],
                },
              },
            },
          },
          {
            props: {
              color: "info",
            },
            style: {
              "&:hover": {
                borderColor: info["main"],
              },
              "&.Mui-checked": {
                color: info["main"],
                "&:hover": {
                  color: info["main"],
                },
              },
            },
          },
          {
            props: {
              color: "default",
            },
            style: {
              color: theme.palette.grey[400],
              "&:hover": {
                borderColor: grey[800],
              },
              "&.Mui-checked": {
                color: grey[800],
                "&:hover": {
                  color: grey[800],
                },
              },
            },
          },
        ],
      }),
    },
  },
};
