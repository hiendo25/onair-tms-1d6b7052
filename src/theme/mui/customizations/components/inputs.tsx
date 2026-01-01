import { filledInputClasses, formLabelClasses, inputBaseClasses } from "@mui/material";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { alpha, Components, Theme } from "@mui/material/styles";

import { error, grey } from "../../theme-color";

export const inputsCustomizations: Components<Theme> = {
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }) => ({
        "&::placeholder": {
          opacity: 1,
          color: grey[800],
        },
      }),
      adornedEnd: {
        ".MuiInputBase-input": {
          paddingRight: 0,
        },
      },
      adornedStart: {
        ".MuiInputBase-input": {
          paddingLeft: 0,
        },
      },
      input: {
        height: "20px",
      },
    },
  },
  // MuiInputLabel: {
  //   styleOverrides: {
  //     root: ({ theme }) => ({
  //       paddingInlineStart: "0.125rem",
  //       paddingInlineEnd: "0.125rem",
  //       [`&.MuiInputLabel-outlined`]: {
  //         backgroundColor: "white",
  //       },
  //       ...theme.applyStyles("dark", {
  //         [`&.MuiInputLabel-outlined.MuiFormLabel-filled`]: {
  //           backgroundColor: "black",
  //         },
  //       }),
  //     }),
  //   },
  // },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.text.primary,
        fontSize: theme.typography.fontSize,
        ".MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.grey[400],
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.grey[400],
        },
        "&.Mui-disabled": {
          backgroundColor: theme.palette.grey[200],
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.grey[400],
          },
        },
        [`&.${outlinedInputClasses.focused}`]: {
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary["main"],
          },
        },
        [`&.${outlinedInputClasses.error}`]: {
          borderColor: theme.palette.error["main"],
        },

        ...theme.applyStyles("dark", {
          "&:hover": {
            borderColor: theme.palette.primary["main"],
          },
        }),
      }),
      adornedStart: {
        paddingLeft: "12px",
      },
      adornedEnd: {
        paddingRight: "12px",
      },
      error: ({ theme }) => ({
        borderColor: theme.palette.error["main"],
      }),
      input: {
        variants: [
          {
            props: {
              size: "small",
            },
            style: ({ theme }) => ({
              padding: "8px 12px",
            }),
          },
          {
            props: {
              size: "medium",
            },
            style: ({ theme }) => ({
              padding: "10px 12px",
            }),
          },
        ],
      },
    },
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: ({ theme }) => ({
        // margin: 0,
        color: (theme.vars || theme).palette.grey[600],
        "&:hover": (theme.vars || theme).palette.grey[700],
        ...theme.applyStyles("dark", {
          color: (theme.vars || theme).palette.grey[400],
        }),
      }),
    },
  },
  MuiFormControl: {
    styleOverrides: {
      root: {
        width: "100%",
        "& .MuiFormLabel-root": {
          "&.MuiInputLabel-sizeSmall": {
            transform: "translate(12px, 11px) scale(1)",
            "&.Mui-focused, &.MuiFormLabel-filled": {
              transform: "translate(12px, 3px) scale(0.75)",
            },
          },
          "&:not(.MuiInputLabel-root) ~ .MuiFilledInput-root": {
            ".MuiFilledInput-input.MuiInputBase-inputSizeSmall": {
              paddingBottom: "10px",
              paddingTop: "10px",
            },
          },
          "&.MuiInputLabel-root ~ .MuiFilledInput-root": {
            ".MuiFilledInput-input.MuiInputBase-inputSizeSmall": {
              paddingBottom: "4px",
              paddingTop: "16px",
            },
          },
        },
      },
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        typography: theme.typography.caption,
        color: "hsla(0, 0%, 0%, 1)",
        marginBottom: 8,
        fontWeight: 500,
        fontSize: theme.typography.fontSize,
        [`&.${formLabelClasses.focused}`]: {
          color: "inherit",
        },
      }),
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.grey[200],
        fontSize: theme.typography.fontSize,
        "&.Mui-focused": {
          background: alpha(theme.palette.grey[300], 0.6),
        },
        "&:hover, &:focus": {
          background: alpha(theme.palette.grey[300], 0.6),
        },
        ["&::after"]: {
          border: "none",
        },
        ["&::before"]: {
          border: "none",
          content: "none",
        },
        "&.Mui-disabled": {
          background: theme.palette.grey[300],
        },
        variants: [
          {
            props: {
              size: "small",
            },
            style: (theme) => ({
              "& .MuiInputBase-input": {
                paddingBlock: "8px",
              },
            }),
          },
          {
            props: {
              size: "medium",
            },
            style: (theme) => ({
              "& .MuiInputBase-input": {
                paddingBlock: "10px",
              },
            }),
          },
        ],
      }),
      adornedStart: {
        paddingLeft: "12px",
        ".MuiInputAdornment-root": {
          marginTop: "0 !important",
        },
      },
      adornedEnd: {
        paddingRight: "12px",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        variants: [
          {
            props: {
              variant: "outlined",
            },
          },
          {
            props: {
              variant: "filled",
            },
            style: (theme) => ({
              [`.${filledInputClasses.root}`]: {
                [`&.${filledInputClasses.error}`]: {
                  backgroundColor: error[8],
                },
              },
            }),
          },
        ],
      }),
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        marginLeft: "-8px",
      }),
    },
  },
};
