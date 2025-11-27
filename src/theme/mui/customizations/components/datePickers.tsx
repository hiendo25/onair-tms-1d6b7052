import { alpha, Theme } from "@mui/material/styles";
import type { PickerComponents } from "@mui/x-date-pickers/themeAugmentation";
import { menuItemClasses } from "@mui/material/MenuItem";
import { pickersDayClasses, yearCalendarClasses } from "@mui/x-date-pickers";
import { grey, primary } from "../../theme-color";
import { CalendarDateIcon2 } from "@/shared/assets/icons";
import { theme } from "../../AppTheme";

/* eslint-disable import/prefer-default-export */
export const datePickersCustomizations: PickerComponents<Theme> = {
  MuiPickerPopper: {
    styleOverrides: {
      paper: ({ theme }) => ({
        marginTop: 4,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        backgroundImage: "none",
        background: "hsl(0, 0%, 100%)",
        boxShadow: "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px",
        [`& .${menuItemClasses.root}`]: {
          borderRadius: 6,
          margin: "0 6px",
        },
        ...theme.applyStyles("dark", {
          background: grey[900],
          boxShadow: "hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px",
        }),
      }),
    },
  },

  MuiDateCalendar: {
    styleOverrides: {
      root: {
        width: "280px",
        height: "310px",
        maxHeight: "310px",
        ".MuiDayCalendar-header": {
          ".MuiTypography-root": {},
        },
      },
      viewTransitionContainer: {},
    },
  },
  MuiDayCalendar: {
    styleOverrides: {
      root: {
        ".MuiButtonBase-root": {
          width: "32px",
          height: "32px",
        },
        ".MuiDayCalendar-header": {
          ".MuiTypography-root": {
            width: "32px",
            height: "36px",
          },
        },
      },
      monthContainer: {},
      weekDayLabel: {},
      weekNumberLabel: {},
    },
  },

  MuiDateTimePicker: {
    defaultProps: {
      ampm: false,
      format: "HH:mm DD/MM/YYYY",
      slots: {
        openPickerIcon: CalendarDateIcon2,
      },
    },
  },
  MuiPickersOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .MuiButtonBase-root": {
          backgroundColor: "transparent",
          color: theme.palette.grey[500],
        },
      }),
    },
  },
  MuiPickersArrowSwitcher: {
    styleOverrides: {
      spacer: { width: 16 },
      button: ({ theme }) => ({
        backgroundColor: "transparent",
        width: "32px",
        height: "32px",
        padding: "6px",
        color: (theme.vars || theme).palette.grey[500],
        ...theme.applyStyles("dark", {
          color: (theme.vars || theme).palette.grey[400],
        }),
      }),
    },
  },
  MuiPickersCalendarHeader: {
    styleOverrides: {
      switchViewButton: {
        padding: 0,
        border: "none",
        width: "32px",
        height: "32px",
      },
    },
  },
  MuiPickersSlideTransition: {
    styleOverrides: {
      root: {
        minHeight: "220px !important",
      },
    },
  },
  MuiMonthCalendar: {
    styleOverrides: {
      button: ({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: (theme.vars || theme).palette.grey[800],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        "&:hover": {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        [`&.${yearCalendarClasses.selected}`]: {
          backgroundColor: grey[700],
          fontWeight: theme.typography.fontWeightMedium,
        },
        "&:focus": {
          outline: `3px solid ${alpha(primary["main"], 0.5)}`,
          outlineOffset: "2px",
          backgroundColor: "transparent",
          [`&.${yearCalendarClasses.selected}`]: { backgroundColor: grey[700] },
        },
        ...theme.applyStyles("dark", {
          color: (theme.vars || theme).palette.grey[300],
          "&:hover": {
            backgroundColor: (theme.vars || theme).palette.action.hover,
          },
          [`&.${yearCalendarClasses.selected}`]: {
            color: (theme.vars || theme).palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: grey[300],
          },
          "&:focus": {
            outline: `3px solid ${alpha(primary["main"], 0.5)}`,
            outlineOffset: "2px",
            backgroundColor: "transparent",
            [`&.${yearCalendarClasses.selected}`]: {
              backgroundColor: grey[300],
            },
          },
        }),
      }),
    },
  },
  MuiYearCalendar: {
    styleOverrides: {
      root: {
        width: "280px",
        maxHeight: "252px",
      },
      button: ({ theme }) => ({
        fontSize: theme.typography.body2.fontSize,
        color: (theme.vars || theme).palette.grey[800],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        height: "fit-content",
        width: "62px",
        "&:hover": {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        [`&.${yearCalendarClasses.selected}`]: {
          backgroundColor: grey[700],
          fontWeight: theme.typography.fontWeightMedium,
        },
        "&:focus": {
          // outline: `3px solid ${alpha(primary["main"], 0.5)}`,
          // outlineOffset: "2px",
          backgroundColor: theme.palette.grey[200],
          [`&.${yearCalendarClasses.selected}`]: { backgroundColor: grey[600] },
        },
        ...theme.applyStyles("dark", {
          color: (theme.vars || theme).palette.grey[300],
          "&:hover": {
            backgroundColor: (theme.vars || theme).palette.action.hover,
          },
          [`&.${yearCalendarClasses.selected}`]: {
            color: (theme.vars || theme).palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: grey[300],
          },
          "&:focus": {
            // outline: `3px solid ${alpha(primary["main"], 0.5)}`,
            // outlineOffset: "2px",
            // backgroundColor: "transparent",
            [`&.${yearCalendarClasses.selected}`]: {
              backgroundColor: grey[300],
            },
          },
        }),
      }),
    },
  },
  MuiPickersLayout: {
    styleOverrides: {
      actionBar: {
        padding: "8px",
        ".MuiButtonBase-root": {
          borderRadius: "0.425rem",
          height: "2rem",
        },
      },
    },
  },
  MuiPickersInputBase: {
    styleOverrides: {
      root: {
        ".MuiInputAdornment-positionEnd": {
          ".MuiButtonBase-root": {
            marginRight: "-10px",
          },
        },
      },
    },
  },
  MuiPickersDay: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: "0.875rem",
        color: (theme.vars || theme).palette.grey[800],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        width: "32px",
        height: "32px",
        "&:hover": {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        [`&.${pickersDayClasses.selected}`]: {
          backgroundColor: theme.palette.primary["main"],
          fontWeight: theme.typography.fontWeightMedium,
        },
        "&:focus": {
          backgroundColor: "transparent",
          [`&.${pickersDayClasses.selected}`]: { backgroundColor: theme.palette.primary["main"] },
        },
        ...theme.applyStyles("dark", {
          color: (theme.vars || theme).palette.grey[300],
          "&:hover": {
            backgroundColor: (theme.vars || theme).palette.action.hover,
          },
          [`&.${pickersDayClasses.selected}`]: {
            color: (theme.vars || theme).palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: grey[300],
          },
          "&:focus": {
            outline: `3px solid ${alpha(primary["main"], 0.5)}`,
            outlineOffset: "2px",
            backgroundColor: "transparent",
            [`&.${pickersDayClasses.selected}`]: { backgroundColor: grey[300] },
          },
        }),
      }),
      today: ({ theme }) => ({
        borderColor: `${theme.palette.grey[500]} !important`,
      }),
    },
  },
  MuiMultiSectionDigitalClock: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: "0.875rem",
        maxHeight: "310px !important",
        ".MuiButtonBase-root": {
          padding: "4px",
        },
        "& .MuiMultiSectionDigitalClockSection-root": {
          scrollbarWidth: "none",
          // scrollbarGutter: "stable both-edges",
          overflowY: "auto",
          width: "48px",
          "&::-webkit-scrollbar": {
            with: "2px",
            backgroundColor: "red",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.grey[400],
            borderRadius: 6,
            "&:hover": {
              backgroundColor: theme.palette.grey[500],
            },
          },
        },

        "& .MuiMultiSectionDigitalClockSection-item": {
          fontSize: "0.875rem",
          width: "auto",
          "&:last-of-type": {
            marginBottom: "4px",
          },
        },
      }),
    },
  },
};
