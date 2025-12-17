import { buttonBaseClasses } from "@mui/material/ButtonBase";
import { chipClasses } from "@mui/material/Chip";
import { iconButtonClasses } from "@mui/material/IconButton";
import { alpha, Components, Theme } from "@mui/material/styles";
import { svgIconClasses } from "@mui/material/SvgIcon";
import { typographyClasses } from "@mui/material/Typography";

import { black, error, grey, success, white } from "../../theme-color";

export const dataDisplayCustomizations: Components<Theme> = {
  MuiList: {
    styleOverrides: {
      root: {
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${svgIconClasses.root}`]: {
          width: "1rem",
          height: "1rem",
          color: black[900],
        },
        [`& .${typographyClasses.root}`]: {
          fontWeight: 600,
          color: black[900],
        },
        [`& .${buttonBaseClasses.root}`]: {
          display: "flex",
          gap: 8,
          padding: "2px 8px",
          borderRadius: (theme.vars || theme).shape.borderRadius,
          "&.Mui-selected": {
            opacity: 1,
            backgroundColor: alpha(theme.palette.action.selected, 0.2),
            "&:focus-visible": {
              backgroundColor: alpha(theme.palette.action.selected, 0.2),
            },
            "&:hover": {
              backgroundColor: alpha(theme.palette.action.selected, 0.2),
            },
          },
          "&:hover": {
            backgroundColor: alpha(theme.palette.action.selected, 0.2),
          },
          "&:focus-visible": {
            backgroundColor: "transparent",
          },
        },
        ...theme.applyStyles("dark", {
          [`& .${svgIconClasses.root}`]: {
            color: white[80],
          },
          [`& .${typographyClasses.root}`]: {
            color: white[80],
          },
        }),
      }),
    },
  },
  MuiListItemText: {
    styleOverrides: {
      primary: ({ theme }) => ({
        fontSize: theme.typography.body2.fontSize,
        fontWeight: 500,
        lineHeight: theme.typography.body2.lineHeight,
      }),
      secondary: ({ theme }) => ({
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.caption.lineHeight,
      }),
    },
  },
  MuiListSubheader: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: "transparent",
        padding: "4px 8px",
        fontSize: theme.typography.caption.fontSize,
        fontWeight: 500,
        lineHeight: theme.typography.caption.lineHeight,
      }),
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: ({ theme }) => ({
        minWidth: 0,
        // [`& .${svgIconClasses.root}`]: {
        //   color: "red",
        //   ...theme.applyStyles("dark", {
        //     color: "white",
        //   }),
        // },
      }),
    },
  },

  MuiChip: {
    defaultProps: {
      size: "small",
      variant: "filled",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        border: "1px solid",
        borderRadius: "999px",
        [`& .${chipClasses.label}`]: {
          fontWeight: 600,
        },
        variants: [
          {
            props: {
              color: "default",
            },
            style: {
              borderColor: grey[200],
              backgroundColor: grey[100],
              [`& .${chipClasses.label}`]: {
                color: grey[500],
              },
              [`& .${chipClasses.icon}`]: {
                color: grey[500],
              },
              ...theme.applyStyles("dark", {
                borderColor: grey[700],
                backgroundColor: grey[800],
                [`& .${chipClasses.label}`]: {
                  color: grey[300],
                },
                [`& .${chipClasses.icon}`]: {
                  color: grey[300],
                },
              }),
            },
          },
          {
            props: {
              color: "success",
              variant: "filled",
            },
            style: {
              borderColor: success["main"],
              backgroundColor: success[8],
              [`& .${chipClasses.label}`]: {
                color: success["main"],
              },
              [`& .${chipClasses.icon}`]: {
                color: success["main"],
              },
              ...theme.applyStyles("dark", {
                borderColor: success["darker"],
                backgroundColor: success["darker"],
                [`& .${chipClasses.label}`]: {
                  color: success["light"],
                },
                [`& .${chipClasses.icon}`]: {
                  color: success["light"],
                },
              }),
            },
          },
          {
            props: {
              color: "error",
            },
            style: {
              borderColor: error["light"],
              backgroundColor: error["lighter"],
              [`& .${chipClasses.label}`]: {
                color: error["main"],
              },
              [`& .${chipClasses.icon}`]: {
                color: error["main"],
              },
              ...theme.applyStyles("dark", {
                borderColor: error["darker"],
                backgroundColor: error["darker"],
                [`& .${chipClasses.label}`]: {
                  color: error["light"],
                },
                [`& .${chipClasses.icon}`]: {
                  color: error["light"],
                },
              }),
            },
          },
          {
            props: { size: "small" },
            style: {
              maxHeight: 20,
              [`& .${chipClasses.label}`]: {
                fontSize: theme.typography.caption.fontSize,
              },
              [`& .${svgIconClasses.root}`]: {
                fontSize: theme.typography.caption.fontSize,
              },
            },
          },
          {
            props: { size: "medium" },
            style: {
              [`& .${chipClasses.label}`]: {
                fontSize: theme.typography.caption.fontSize,
              },
            },
          },
        ],
      }),
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      actions: {
        display: "flex",
        gap: 8,
        marginRight: 6,
        [`& .${iconButtonClasses.root}`]: {
          minWidth: 0,
          width: 36,
          height: 36,
        },
      },
    },
  },
  MuiPagination: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: "inherit",
        ".MuiPaginationItem-sizeSmall": {
          fontSize: "0.75rem",
          minWidth: "30px",
          height: "30px",
        },

        ".MuiPaginationItem-sizeMedium": {
          fontSize: "0.875rem",
          minWidth: "36px",
          height: "36px",
        },
      }),
    },
  },
  MuiPaginationItem: {
    defaultProps: {
      color: "standard",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        color: "inherit",
        "&:hover": {
          backgroundColor: (theme.vars || theme).palette.grey[300],
        },
        "&.Mui-selected": {
          color: "white",
          backgroundColor: (theme.vars || theme).palette.grey[900],
          "&:hover": {
            backgroundColor: (theme.vars || theme).palette.grey[800],
          },
        },
      }),
      colorPrimary: ({ theme }) => theme.palette.primary["main"],
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        background: "white",
        boxShadow:
          "0px 2px 1px -1px rgba(107, 114, 128, 0.03), 0px 1px 1px 0px rgba(107, 114, 128, 0.04), 0px 1px 3px 0px rgba(107, 114, 128, 0.08)",
      },
    },
  },
  MuiIcon: {
    defaultProps: {
      fontSize: "small",
    },
    styleOverrides: {
      root: {
        variants: [
          {
            props: {
              fontSize: "small",
            },
            style: {
              fontSize: "1rem",
            },
          },
        ],
      },
    },
  },
};
