import { alpha,Components, Theme } from "@mui/material/styles";
import { svgIconClasses } from "@mui/material/SvgIcon";

import { error, grey, info, primary, secondary, success, warning } from "../../theme-color";

 

const getBoxShadowShapeButton = (color: string) => {
  return `0px 6px 9px -6px ${alpha(color, 0.4)}, 0px 6px 12px -4px ${alpha(color, 0.3)}`;
};
export const buttonsCustomizations: Components<Theme> = {
  MuiButtonBase: {
    defaultProps: {
      disableTouchRipple: false,
      disableRipple: false,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        boxSizing: "border-box",
        transition: "all 100ms ease-in",
        "&:focus-visible": {
          outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          outlineOffset: "2px",
        },
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      variant: "contained",
      color: "primary",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: "none",
        borderRadius: (theme.vars || theme).shape.borderRadius,
        textTransform: "none",
        fontWeight: "600",
        ["&:hover"]: {
          boxShadow: "none",
        },
        variants: [
          {
            props: {
              size: "small",
            },
            style: {
              height: "1.875rem", //36px
              padding: "0.5rem 0.75rem", //8px 12px
              borderRadius: "0.5rem", // 8px
            },
          },
          {
            props: {
              size: "medium",
            },
            style: {
              height: "2.25rem", // 40px
              borderRadius: "0.625rem", //10px
            },
          },
          {
            props: {
              size: "large",
            },
            style: {
              height: "2.5rem", // 44px
              borderRadius: "0.625rem", //10px
            },
          },
          {
            props: {
              color: "primary",
              variant: "contained",
            },
            style: {
              color: "white",
              backgroundColor: primary["main"],
              "&:hover": {
                backgroundColor: primary["dark"],
                boxShadow: getBoxShadowShapeButton(primary["dark"]),
              },
              "&:active": {
                backgroundColor: primary["dark"],
              },
              "&:disabled": {
                color: "white",
                backgroundColor: alpha(primary["main"], 0.6),
              },
              ...theme.applyStyles("dark", {
                color: "white",
                backgroundColor: primary["main"],
                "&:hover": {
                  backgroundColor: primary["dark"],
                  boxShadow: getBoxShadowShapeButton(primary["dark"]),
                },
                "&:active": {
                  backgroundColor: primary["dark"],
                },
              }),
            },
          },
          {
            props: {
              color: "secondary",
              variant: "contained",
            },
            style: {
              color: "white",
              backgroundColor: secondary["main"],
              "&:hover": {
                backgroundColor: secondary["dark"],
                boxShadow: getBoxShadowShapeButton(secondary["dark"]),
              },
              "&:active": {
                backgroundColor: secondary["dark"],
                backgroundImage: "none",
              },
            },
          },
          {
            props: {
              color: "success",
              variant: "contained",
            },
            style: {
              color: "white",
              backgroundColor: success["main"],
              "&:hover": {
                backgroundColor: success["dark"],
                boxShadow: getBoxShadowShapeButton(success["dark"]),
              },
              "&:active": {
                backgroundColor: success["dark"],
                backgroundImage: "none",
              },
            },
          },
          {
            props: {
              color: "warning",
              variant: "contained",
            },
            style: {
              color: "black",
              backgroundColor: warning["main"],
              "&:hover": {
                backgroundColor: warning["dark"],
                boxShadow: getBoxShadowShapeButton(warning["dark"]),
              },
              "&:active": {
                backgroundColor: warning["dark"],
                backgroundImage: "none",
              },
            },
          },
          {
            props: {
              color: "error",
              variant: "contained",
            },
            style: {
              color: "white",
              backgroundColor: error["main"],
              "&:hover": {
                backgroundColor: error["dark"],
                boxShadow: getBoxShadowShapeButton(error["dark"]),
              },
              "&:active": {
                backgroundColor: error["dark"],
                backgroundImage: "none",
              },
            },
          },
          {
            props: {
              color: "info",
              variant: "contained",
            },
            style: {
              color: "white",
              backgroundColor: info["main"],
              "&:hover": {
                backgroundColor: info["dark"],
                boxShadow: getBoxShadowShapeButton(info["dark"]),
              },
              "&:active": {
                backgroundColor: info["dark"],
                backgroundImage: "none",
              },
            },
          },
          {
            props: {
              color: "inherit",
              variant: "contained",
            },
            style: {
              color: "white",
              backgroundColor: grey[800],
              "&:hover": {
                backgroundColor: grey[700],
                boxShadow: getBoxShadowShapeButton(grey[700]),
              },
              "&:active": {
                backgroundColor: grey[700],
              },
            },
          },
          {
            props: {
              color: "primary",
              variant: "outlined",
            },
            style: {
              color: primary["main"],
              borderColor: primary["main"],
              border: "1px solid",
              "&:hover": {
                backgroundColor: alpha(primary["main"], 0.1),
                boxShadow: `0px 0px 0px 0.75px ${primary["main"]}`,
              },
              "&:active": {
                backgroundColor: alpha(primary["main"], 0.1),
                boxShadow: `0px 0px 0px 0.75px ${primary["main"]}`,
              },
              ...theme.applyStyles("dark", {
                color: primary["main"],
                borderColor: primary["main"],
                border: "1px solid",
                "&:hover": {
                  color: primary["main"],
                  borderColor: primary["main"],
                  backgroundColor: alpha(primary["main"], 0.1),
                  boxShadow: `0px 0px 0px 0.75px ${primary["main"]}`,
                },
                "&:active": {
                  color: primary["main"],
                  borderColor: primary["main"],
                  backgroundColor: alpha(primary["main"], 0.1),
                  boxShadow: `0px 0px 0px 0.75px ${primary["main"]}`,
                },
              }),
            },
          },
          {
            props: {
              color: "secondary",
              variant: "outlined",
            },
            style: {
              color: secondary["main"],
              borderColor: secondary["main"],
              border: "1px solid",
              "&:hover": {
                backgroundColor: alpha(secondary["main"], 0.05),
                boxShadow: `0px 0px 0px 0.75px ${secondary["main"]}`,
              },
              "&:active": {
                backgroundColor: alpha(secondary["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: secondary["main"],
                borderColor: secondary["main"],
                "&:hover": {
                  color: secondary["main"],
                  borderColor: secondary["main"],
                  backgroundColor: alpha(secondary["main"], 0.05),
                  boxShadow: `0px 0px 0px 0.75px ${secondary["main"]}`,
                },
                "&:active": {
                  borderColor: secondary["main"],
                  backgroundColor: alpha(secondary["main"], 0.05),
                  boxShadow: `0px 0px 0px 0.75px ${secondary["main"]}`,
                },
              }),
            },
          },
          {
            props: {
              color: "success",
              variant: "outlined",
            },
            style: {
              color: success["main"],
              borderColor: success["main"],
              border: "1px solid",
              "&:hover": {
                backgroundColor: alpha(success["main"], 0.05),
                boxShadow: `0px 0px 0px 0.75px ${success["main"]}`,
              },
              "&:active": {
                backgroundColor: alpha(success["main"], 0.05),
                boxShadow: `0px 0px 0px 0.75px ${success["main"]}`,
              },
              ...theme.applyStyles("dark", {
                color: success["main"],
                border: "1px solid",
                borderColor: success["main"],
                "&:hover": {
                  color: success["main"],
                  backgroundColor: alpha(success["main"], 0.05),
                  borderColor: success["main"],
                  boxShadow: `0px 0px 0px 0.75px ${success["main"]}`,
                },
                "&:active": {
                  color: success["main"],
                  backgroundColor: alpha(success["main"], 0.05),
                  borderColor: success["main"],
                  boxShadow: `0px 0px 0px 0.75px ${success["main"]}`,
                },
              }),
            },
          },
          {
            props: {
              color: "warning",
              variant: "outlined",
            },
            style: {
              color: warning["main"],
              border: "1px solid",
              borderColor: warning["main"],
              "&:hover": {
                backgroundColor: alpha(warning["main"], 0.1),
                borderColor: warning["main"],
                boxShadow: `0px 0px 0px 0.75px ${warning["main"]}`,
                color: warning["main"],
              },
              "&:active": {
                backgroundColor: alpha(warning["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: warning["main"],
                border: "1px solid",
                borderColor: warning["main"],
                "&:hover": {
                  color: warning["main"],
                  borderColor: warning["main"],
                  backgroundColor: alpha(warning["main"], 0.1),
                  boxShadow: `0px 0px 0px 0.75px ${warning["main"]}`,
                },
                "&:active": {
                  backgroundColor: alpha(warning["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "error",
              variant: "outlined",
            },
            style: {
              color: error["main"],
              border: "1px solid",
              borderColor: error["main"],
              "&:hover": {
                backgroundColor: alpha(error["main"], 0.1),
                borderColor: error["main"],
                boxShadow: `0px 0px 0px 0.75px ${error["main"]}`,
                color: error["main"],
              },
              "&:active": {
                backgroundColor: alpha(error["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: error["main"],
                border: "1px solid",
                borderColor: error["main"],
                "&:hover": {
                  color: error["main"],
                  borderColor: error["main"],
                  backgroundColor: alpha(error["main"], 0.1),
                  boxShadow: `0px 0px 0px 0.75px ${error["main"]}`,
                },
                "&:active": {
                  backgroundColor: alpha(error["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "info",
              variant: "outlined",
            },
            style: {
              color: info["main"],
              border: "1px solid",
              borderColor: info["main"],
              "&:hover": {
                backgroundColor: alpha(info["main"], 0.1),
                boxShadow: `0px 0px 0px 0.75px ${info["main"]}`,
              },
              "&:active": {
                backgroundColor: alpha(info["main"], 0.1),
                boxShadow: `0px 0px 0px 0.75px ${info["main"]}`,
              },
              ...theme.applyStyles("dark", {
                color: info["main"],
                border: "1px solid",
                borderColor: info["main"],
                "&:hover": {
                  borderColor: info["main"],
                  boxShadow: `0px 0px 0px 0.75px ${info["main"]}`,
                },
                "&:active": {
                  borderColor: info["main"],
                  boxShadow: `0px 0px 0px 0.75px ${info["main"]}`,
                },
              }),
            },
          },
          {
            props: {
              color: "inherit",
              variant: "outlined",
            },
            style: {
              color: grey[900],
              border: "1px solid",
              borderColor: grey[400],
              "&:hover": {
                backgroundColor: alpha(grey[600], 0.1),
                boxShadow: `0px 0px 0px 0.75px ${grey[900]}`,
              },
              "&:active": {
                backgroundColor: alpha(grey[900], 0.1),
                boxShadow: `0px 0px 0px 0.75px ${grey[900]}`,
              },
              ...theme.applyStyles("dark", {
                color: grey[900],
                border: "1px solid",
                borderColor: grey[900],
                "&:hover": {
                  borderColor: grey[900],
                  boxShadow: `0px 0px 0px 0.75px ${grey[900]}`,
                },
                "&:active": {
                  borderColor: grey[900],
                  boxShadow: `0px 0px 0px 0.75px ${grey[900]}`,
                },
              }),
            },
          },
          {
            props: {
              color: "primary",
              variant: "fill",
            },
            style: {
              color: primary["dark"],
              backgroundColor: alpha(primary["main"], 0.08),
              "&:hover": {
                backgroundColor: alpha(primary["main"], 0.16),
              },
              "&:active": {
                backgroundColor: alpha(primary["main"], 0.16),
              },
            },
          },
          {
            props: {
              color: "secondary",
              variant: "fill",
            },
            style: {
              color: secondary["dark"],
              backgroundColor: alpha(secondary["main"], 0.08),
              "&:hover": {
                backgroundColor: alpha(secondary["main"], 0.16),
              },
              "&:active": {
                backgroundColor: alpha(secondary["main"], 0.16),
              },
            },
          },
          {
            props: {
              color: "success",
              variant: "fill",
            },
            style: {
              color: success["dark"],
              backgroundColor: alpha(success["main"], 0.08),
              "&:hover": {
                backgroundColor: alpha(success["main"], 0.16),
              },
              "&:active": {
                backgroundColor: alpha(success["main"], 0.16),
              },
            },
          },
          {
            props: {
              color: "warning",
              variant: "fill",
            },
            style: {
              color: warning["dark"],
              backgroundColor: alpha(warning["main"], 0.08),
              "&:hover": {
                backgroundColor: alpha(warning["main"], 0.16),
              },
              "&:active": {
                backgroundColor: alpha(warning["main"], 0.16),
              },
            },
          },
          {
            props: {
              color: "error",
              variant: "fill",
            },
            style: {
              color: error["dark"],
              backgroundColor: alpha(error["main"], 0.08),
              "&:hover": {
                backgroundColor: alpha(error["main"], 0.16),
              },
              "&:active": {
                backgroundColor: alpha(error["main"], 0.16),
              },
            },
          },
          {
            props: {
              color: "info",
              variant: "fill",
            },
            style: {
              color: info["dark"],
              backgroundColor: alpha(info["main"], 0.08),
              "&:hover": {
                backgroundColor: alpha(info["main"], 0.16),
              },
              "&:active": {
                backgroundColor: alpha(info["main"], 0.16),
              },
            },
          },
          {
            props: {
              color: "inherit",
              variant: "fill",
            },
            style: {
              color: grey[800],
              backgroundColor: alpha(grey[600], 0.08),
              "&:hover": {
                backgroundColor: alpha(grey[600], 0.24),
              },
              "&:active": {
                backgroundColor: alpha(grey[600], 0.24),
              },
              ...theme.applyStyles("dark", {
                color: grey["300"],
                backgroundColor: alpha(grey[800], 0.9),
                "&:hover": {
                  backgroundColor: alpha(grey[700], 0.6),
                },
                "&:active": {
                  backgroundColor: alpha(grey[700], 0.6),
                },
              }),
            },
          },
          {
            props: {
              variant: "text",
            },
            style: {
              color: grey[600],
              "&:hover": {
                backgroundColor: grey[100],
              },
              "&:active": {
                backgroundColor: grey[200],
              },
              ...theme.applyStyles("dark", {
                color: grey[100],
                "&:hover": {
                  backgroundColor: grey[700],
                },
                "&:active": {
                  backgroundColor: alpha(grey[700], 0.7),
                },
              }),
            },
          },
          {
            props: {
              color: "primary",
              variant: "text",
            },
            style: {
              color: primary["main"],
              "&:hover": {
                backgroundColor: alpha(primary["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(primary["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: primary["main"],
                "&:hover": {
                  backgroundColor: alpha(primary["main"], 0.1),
                },
                "&:active": {
                  backgroundColor: alpha(primary["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "secondary",
              variant: "text",
            },
            style: {
              color: secondary["main"],
              "&:hover": {
                backgroundColor: alpha(secondary["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(secondary["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: secondary["main"],
                "&:hover": {
                  backgroundColor: alpha(secondary["main"], 0.1),
                },
                "&:active": {
                  backgroundColor: alpha(secondary["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "success",
              variant: "text",
            },
            style: {
              color: success["main"],
              "&:hover": {
                backgroundColor: alpha(success["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(success["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: success["main"],
                "&:hover": {
                  backgroundColor: alpha(success["main"], 0.1),
                },
                "&:active": {
                  backgroundColor: alpha(success["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "warning",
              variant: "text",
            },
            style: {
              color: warning["main"],
              "&:hover": {
                backgroundColor: alpha(warning["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(warning["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: warning["main"],
                "&:hover": {
                  backgroundColor: alpha(warning["main"], 0.1),
                },
                "&:active": {
                  backgroundColor: alpha(warning["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "error",
              variant: "text",
            },
            style: {
              color: error["main"],
              "&:hover": {
                backgroundColor: alpha(error["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(error["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: error["main"],
                "&:hover": {
                  backgroundColor: alpha(error["main"], 0.1),
                },
                "&:active": {
                  backgroundColor: alpha(error["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "info",
              variant: "text",
            },
            style: {
              color: info["main"],
              "&:hover": {
                backgroundColor: alpha(info["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(info["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: info["main"],
                "&:hover": {
                  backgroundColor: alpha(info["main"], 0.1),
                },
                "&:active": {
                  backgroundColor: alpha(info["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "inherit",
              variant: "text",
            },
            style: {
              color: grey[800],
              "&:hover": {
                backgroundColor: alpha(grey[600], 0.16),
              },
              "&:active": {
                backgroundColor: alpha(grey[600], 0.16),
              },
              ...theme.applyStyles("dark", {
                color: grey[800],
                "&:hover": {
                  backgroundColor: alpha(grey[600], 0.16),
                },
                "&:active": {
                  backgroundColor: alpha(grey[600], 0.16),
                },
              }),
            },
          },
        ],
      }),
    },
  },
  MuiIconButton: {
    defaultProps: {},
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: "none",
        // borderRadius: (theme.vars || theme).shape.borderRadius,
        textTransform: "none",
        fontWeight: theme.typography.fontWeightMedium,
        letterSpacing: 0,
        color: (theme.vars || theme).palette.text.primary,
        // display: "inline-flex",
        // alignItems: "center",
        // justifyContent: "center",
        // border: "1px solid ",
        // borderColor: gray[200],
        backgroundColor: alpha(grey[100], 0.3),
        "&:hover": {
          backgroundColor: grey[100],
          borderColor: grey[300],
        },
        "&:active": {
          backgroundColor: grey[200],
        },
        ...theme.applyStyles("dark", {
          backgroundColor: grey[800],
          borderColor: grey[700],
          "&:hover": {
            backgroundColor: grey[900],
            borderColor: grey[600],
          },
          "&:active": {
            backgroundColor: grey[900],
          },
        }),
        variants: [
          {
            props: {
              size: "small",
            },
            style: {
              width: "2.25rem",
              height: "2.25rem",
              padding: "0.25rem",
              [`& .${svgIconClasses.root}`]: { fontSize: "1.25rem" },
            },
          },
          {
            props: {
              size: "medium",
            },
            style: {
              width: "2.5rem",
              height: "2.5rem",
            },
          },
          {
            props: {
              size: "large",
            },
            style: {
              width: "2.75rem",
              height: "2.75rem",
              [`& .${svgIconClasses.root}`]: { fontSize: "1.75rem" },
            },
          },
          {
            props: {
              color: "primary",
            },
            style: {
              color: primary["main"],
              "&:hover": {
                backgroundColor: alpha(primary["main"], 0.05),
              },
              "&:active": {
                backgroundColor: alpha(primary["main"], 0.05),
              },
              ...theme.applyStyles("dark", {
                color: primary["main"],
                backgroundColor: alpha(primary["main"], 0.0),
                "&:hover": {
                  color: primary["main"],
                  backgroundColor: alpha(primary["main"], 0.3),
                },
                "&:active": {
                  color: primary["main"],
                  backgroundColor: alpha(primary["main"], 0.3),
                },
              }),
            },
          },
          {
            props: {
              color: "secondary",
            },
            style: {
              color: secondary["main"],
              "&:hover": {
                backgroundColor: alpha(secondary["main"], 0.05),
              },
              "&:active": {
                backgroundColor: alpha(secondary["main"], 0.05),
              },
              ...theme.applyStyles("dark", {
                color: secondary["main"],
                backgroundColor: alpha(secondary["main"], 0.05),
                "&:hover": {
                  color: secondary["main"],
                  backgroundColor: alpha(secondary["main"], 0.05),
                },
                "&:active": {
                  color: secondary["main"],
                  backgroundColor: alpha(secondary["main"], 0.05),
                },
              }),
            },
          },
          {
            props: {
              color: "success",
            },
            style: {
              color: success["main"],
              "&:hover": {
                backgroundColor: alpha(success["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(success["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: success["main"],
                backgroundColor: alpha(success["main"], 0.1),
                "&:hover": {
                  color: success["main"],
                  backgroundColor: alpha(success["main"], 0.1),
                },
                "&:active": {
                  color: success["main"],
                  backgroundColor: alpha(success["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "warning",
            },
            style: {
              color: warning["main"],
              "&:hover": {
                backgroundColor: alpha(warning["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(warning["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: warning["main"],
                "&:hover": {
                  color: warning["main"],
                  backgroundColor: alpha(warning["main"], 0.1),
                },
                "&:active": {
                  color: warning["main"],
                  backgroundColor: alpha(warning["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "info",
            },
            style: {
              color: info["main"],
              "&:hover": {
                backgroundColor: alpha(info["main"], 0.1),
              },
              "&:active": {
                backgroundColor: alpha(info["main"], 0.1),
              },
              ...theme.applyStyles("dark", {
                color: info["main"],
                "&:hover": {
                  color: info["main"],
                  backgroundColor: alpha(info["main"], 0.1),
                },
                "&:active": {
                  color: info["main"],
                  backgroundColor: alpha(info["main"], 0.1),
                },
              }),
            },
          },
          {
            props: {
              color: "error",
            },
            style: {
              color: error["main"],
              "&:hover": {
                backgroundColor: alpha(error["main"], 0.05),
              },
              "&:active": {
                backgroundColor: alpha(error["main"], 0.05),
              },
              ...theme.applyStyles("dark", {
                color: error["main"],
                backgroundColor: alpha(error["main"], 0.05),
                "&:hover": {
                  color: error["main"],
                  backgroundColor: alpha(error["main"], 0.05),
                },
                "&:active": {
                  color: error["main"],
                  backgroundColor: alpha(error["main"], 0.05),
                },
              }),
            },
          },
          {
            props: {
              color: "default",
            },
            style: {
              color: grey[800],
              backgroundColor: grey[100],
              "&:hover": {
                backgroundColor: alpha(grey[200], 1),
              },
              "&:active": {
                backgroundColor: alpha(grey[200], 1),
              },
              ...theme.applyStyles("dark", {
                color: grey[300],
                backgroundColor: alpha(grey[800], 0.8),
                "&:hover": {
                  backgroundColor: alpha(grey[700], 0.6),
                },
                "&:active": {
                  backgroundColor: alpha(grey[700], 0.6),
                },
              }),
            },
          },
        ],
      }),
    },
  },
  MuiButtonGroup: {
    styleOverrides: {
      root: {},
    },
  },
};
