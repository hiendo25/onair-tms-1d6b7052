import { Components, Theme, alpha } from "@mui/material/styles";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { error, grey, primary } from "../../theme-color";
import { filledInputClasses, formLabelClasses, inputBaseClasses } from "@mui/material";

 
export const inputsCustomizations: Components<Theme> = {
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }) => ({
        "&::placeholder": {
          opacity: 0.8,
          color: grey[600],
        },
      }),
      input: ({ theme }) => ({
        padding: "0.625rem 0.875rem",
      }),
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
      // input: {
      //   padding: "0.5rem 0.875rem",
      // },
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.text.primary,
        fontSize: theme.typography.fontSize,
        // backgroundColor: alpha(theme.palette.grey[100], 0.3),
        ".MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.grey[300],
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.grey[500],
        },
        [`&.${outlinedInputClasses.focused}`]: {
          // borderColor: theme.palette.primary["main"],
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary["main"],
          },
        },
        [`&.${outlinedInputClasses.error}`]: {
          borderColor: theme.palette.error["main"],
        },
        "&.MuiInputBase-adornedStart": {
          paddingLeft: "10px",
          input: {
            paddingLeft: "0.5rem",
          },
        },
        ...theme.applyStyles("dark", {
          "&:hover": {
            borderColor: theme.palette.primary["main"],
          },
        }),
      }),
      input: {
        // height: "1.4375rem",
        variants: [
          {
            props: {
              size: "small",
            },
            style: ({ theme }) => ({
              padding: "0.625rem 0.875rem",
            }),
          },
          {
            props: {
              size: "medium",
            },
            style: ({ theme }) => ({
              padding: "0.875rem 0.875rem",
            }),
          },
        ],
      },
    },
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.grey[400],
        "&:hover": (theme.vars || theme).palette.grey[600],
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
        // "& .MuiInput-root": {
        //   padding: "0.5rem 0.875rem",
        //   backgroundColor: "transparent",
        // },
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
        fontWeight: 600,
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
        variants: [
          {
            props: {
              size: "small",
            },
            style: (theme) => ({
              "& .MuiInputBase-input": {
                paddingTop: "10px",
                paddingBottom: "10px",
              },
            }),
          },
        ],
      }),
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
              [`& .${filledInputClasses.root}`]: {
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
        marginLeft: "-10px",
      }),
    },
  },
};
