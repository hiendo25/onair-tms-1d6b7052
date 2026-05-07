import { alpha,Components, Theme } from "@mui/material/styles";
import { svgIconClasses } from "@mui/material/SvgIcon";
import { toggleButtonClasses } from "@mui/material/ToggleButton";
import { toggleButtonGroupClasses } from "@mui/material/ToggleButtonGroup";

import {
  error,
  grey,
  info,
  primary,
  secondary,
  success,
  warning,
} from "../../theme-color";

 

export const toggleButtonsCustomizations: Components<Theme> = {
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: ({ theme }) => {
        return {
          width: "fit-content",
          [`& .${toggleButtonGroupClasses.selected}`]: {
            color: "white",
          },
          [`&.${toggleButtonGroupClasses.root}`]: {
            [`& .MuiToggleButton-primary`]: {
              color: "white",
              backgroundColor: primary["main"],
              borderColor: primary["main"],
              "&:hover": {
                backgroundColor: primary["dark"],
                borderColor: primary["dark"],
              },
              [`&.${toggleButtonClasses.selected}`]: {
                color: "white",
                backgroundColor: primary["dark"],
                borderColor: primary["dark"],
                "&:hover": {
                  backgroundColor: primary["dark"],
                  borderColor: primary["dark"],
                },
              },
              [`&.${toggleButtonClasses.disabled}`]: {
                color: "white",
                opacity: 0.6,
                backgroundColor: primary["dark"],
                borderColor: primary["dark"],
              },
            },
            [`& .MuiToggleButton-secondary`]: {
              color: "white",
              background: secondary["main"],
              borderColor: secondary["main"],
              [`&.${toggleButtonClasses.selected}`]: {
                color: "white",
                backgroundColor: secondary["dark"],
                borderColor: secondary["dark"],
                "&:hover": {
                  backgroundColor: secondary["dark"],
                  borderColor: secondary["dark"],
                },
              },
              "&:hover": {
                backgroundColor: secondary["dark"],
                borderColor: secondary["dark"],
              },
              [`&.${toggleButtonClasses.disabled}`]: {
                color: "white",
                opacity: 0.6,
                backgroundColor: secondary["dark"],
                borderColor: secondary["dark"],
              },
            },
            [`& .MuiToggleButton-success`]: {
              color: "white",
              background: success["main"],
              borderColor: success["main"],
              [`&.${toggleButtonClasses.selected}`]: {
                color: "white",
                backgroundColor: success["dark"],
                borderColor: success["dark"],
                "&:hover": {
                  backgroundColor: success["dark"],
                  borderColor: success["dark"],
                },
              },
              "&:hover": {
                backgroundColor: success["dark"],
                borderColor: success["dark"],
              },
              [`&.${toggleButtonClasses.disabled}`]: {
                color: alpha(grey[300], 0.8),
                opacity: 0.6,
                backgroundColor: success["dark"],
                borderColor: success["dark"],
              },
            },
            [`& .MuiToggleButton-warning`]: {
              color: "white",
              background: warning["main"],
              borderColor: warning["main"],
              [`&.${toggleButtonClasses.selected}`]: {
                color: "white",
                backgroundColor: warning["dark"],
                borderColor: warning["dark"],
                "&:hover": {
                  backgroundColor: warning["dark"],
                  borderColor: warning["dark"],
                },
              },
              "&:hover": {
                backgroundColor: warning["dark"],
                borderColor: warning["dark"],
              },
              [`&.${toggleButtonClasses.disabled}`]: {
                color: "white",
                backgroundColor: warning["dark"],
                borderColor: warning["dark"],
                opacity: 0.6,
              },
            },
            [`& .MuiToggleButton-info`]: {
              color: "white",
              background: info["main"],
              borderColor: info["main"],
              [`&.${toggleButtonClasses.selected}`]: {
                color: "white",
                backgroundColor: info["dark"],
                borderColor: info["dark"],
                "&:hover": {
                  backgroundColor: info["dark"],
                  borderColor: info["dark"],
                },
              },
              "&:hover": {
                backgroundColor: info["dark"],
                borderColor: info["dark"],
              },
              [`&.${toggleButtonClasses.disabled}`]: {
                color: "white",
                backgroundColor: info["dark"],
                borderColor: info["dark"],
                opacity: 0.6,
              },
            },
            [`& .Mui-error`]: {
              color: "white",
              background: error["main"],
              borderColor: error["main"],
              [`&.${toggleButtonClasses.selected}`]: {
                color: "white",
                backgroundColor: error["dark"],
                borderColor: error["dark"],
                "&:hover": {
                  backgroundColor: error["dark"],
                  borderColor: error["dark"],
                },
              },
              "&:hover": {
                backgroundColor: error["dark"],
                borderColor: error["dark"],
              },
              [`&.${toggleButtonClasses.disabled}`]: {
                color: "white",
                backgroundColor: error["dark"],
                borderColor: error["dark"],
                opacity: 0.6,
              },
            },
            [`& .MuiToggleButton-standard`]: {
              color: "white",
              background: grey[800],
              borderColor: grey[800],
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: `${grey[900]} !important`,
              },
              [`&.${toggleButtonClasses.selected}`]: {
                color: "white",
                backgroundColor: grey[900],
                borderColor: grey[900],
                "&:hover": {
                  backgroundColor: grey[800],
                  borderColor: grey[800],
                },
              },
              "&:hover": {
                backgroundColor: grey[900],
                borderColor: grey[900],
              },
              [`&.${toggleButtonClasses.disabled}`]: {
                color: "white",
                backgroundColor: grey[800],
                opacity: 0.6,
                borderColor: grey[800],
              },
            },
          },
          [`&.${toggleButtonGroupClasses.horizontal}`]: {
            width: "fit-content",
            [`& .${toggleButtonClasses.root}`]: {
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            "& .MuiToggleButton-primary": {
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: primary["dark"],
              },
            },
            "& .MuiToggleButton-secondary": {
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: secondary["dark"],
              },
            },
            "& .MuiToggleButton-success": {
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: `${success["dark"]} !important`,
              },
            },
            "& .MuiToggleButton-warning": {
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: warning["dark"],
              },
            },
            "& .MuiToggleButton-info": {
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: info["dark"],
              },
            },
            "& .Mui-error": {
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: error["dark"],
              },
            },
            "& .MuiToggleButton-standard": {
              [`&.${toggleButtonGroupClasses.middleButton}`]: {
                borderLeftColor: grey[900],
              },
            },
          },
          [`&.${toggleButtonGroupClasses.vertical}`]: {
            width: "fit-content",
            [`& .${toggleButtonClasses.root}`]: {
              borderRightWidth: 0,
              borderLeftWidth: 0,
            },
            "& .MuiToggleButton-primary": {
              [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]:
                {
                  borderTopColor: primary["dark"],
                },
            },
            "& .MuiToggleButton-secondary": {
              [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]:
                {
                  borderTopColor: secondary["dark"],
                },
            },
            "& .MuiToggleButton-success": {
              [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]:
                {
                  borderTopColor: `${success["dark"]} !important`,
                },
            },
            "& .MuiToggleButton-warning": {
              [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]:
                {
                  borderTopColor: warning["dark"],
                },
            },
            "& .MuiToggleButton-info": {
              [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]:
                {
                  borderTopColor: info["dark"],
                },
            },
            "& .Mui-error": {
              [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]:
                {
                  borderTopColor: error["dark"],
                },
            },
            "& .MuiToggleButton-standard": {
              [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]:
                {
                  borderTopColor: grey[900],
                },
            },
          },
          ...theme.applyStyles("dark", {
            [`& .${toggleButtonGroupClasses.selected}`]: {
              color: primary["light"],
            },
          }),
        };
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: "none",
        fontWeight: theme.typography.fontWeightBold,
        ...theme.applyStyles("dark", {
          color: grey[400],
          [`&.${toggleButtonClasses.selected}`]: {
            color: primary["main"],
          },
        }),
        variants: [
          {
            props: {
              size: "small",
            },
            style: {
              height: "1.875rem", //30px
              borderRadius: "0.5rem", // 8px
              fontSize: "0.75rem",
              padding: "0.125rem 0.5rem",
              [`& .${svgIconClasses.root}`]: { fontSize: "1rem" },
            },
          },
          {
            props: {
              size: "medium",
            },
            style: {
              height: "2.25rem", // 36px
              borderRadius: "0.5rem", //8px
              padding: "0.25rem 0.75rem",
            },
          },
          {
            props: {
              size: "large",
            },
            style: {
              height: "2.5rem", // 36px
              borderRadius: "0.5rem", //8px
              padding: "0.5rem 0.875rem",
            },
          },
        ],
      }),
    },
  },
};
