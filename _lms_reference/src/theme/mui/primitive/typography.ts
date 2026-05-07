import { createTheme } from "@mui/material";

const defaultTheme = createTheme();

export const typography = {
  fontFamily: "var(--font-inter)",
  h1: {
    fontSize: defaultTheme.typography.pxToRem(40),
    fontWeight: 800,
    lineHeight: 1.2,
    [defaultTheme.breakpoints.up("xs")]: {
      fontSize: defaultTheme.typography.pxToRem(40),
    },
    [defaultTheme.breakpoints.up("sm")]: {
      fontSize: defaultTheme.typography.pxToRem(42),
    },
    [defaultTheme.breakpoints.up("md")]: {
      fontSize: defaultTheme.typography.pxToRem(58),
    },
    [defaultTheme.breakpoints.up("lg")]: {
      fontSize: defaultTheme.typography.pxToRem(64),
    },
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(32),
    fontWeight: 800,
    lineHeight: 1.25,
    [defaultTheme.breakpoints.up("xs")]: {
      fontSize: defaultTheme.typography.pxToRem(32),
    },
    [defaultTheme.breakpoints.up("sm")]: {
      fontSize: defaultTheme.typography.pxToRem(40),
    },
    [defaultTheme.breakpoints.up("md")]: {
      fontSize: defaultTheme.typography.pxToRem(44),
    },
    [defaultTheme.breakpoints.up("lg")]: {
      fontSize: defaultTheme.typography.pxToRem(48),
    },
  },

  h3: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 700,
    lineHeight: 1.2,
    [defaultTheme.breakpoints.up("xs")]: {
      fontSize: defaultTheme.typography.pxToRem(24),
    },
    [defaultTheme.breakpoints.up("sm")]: {
      fontSize: defaultTheme.typography.pxToRem(26),
    },
    [defaultTheme.breakpoints.up("md")]: {
      fontSize: defaultTheme.typography.pxToRem(30),
    },
    [defaultTheme.breakpoints.up("lg")]: {
      fontSize: defaultTheme.typography.pxToRem(32),
    },
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 700,
    lineHeight: 1.5,
    [defaultTheme.breakpoints.up("md")]: {
      fontSize: defaultTheme.typography.pxToRem(24),
    },
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
    [defaultTheme.breakpoints.up("md")]: {
      fontSize: defaultTheme.typography.pxToRem(19),
    },
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(17),
    fontWeight: 600,
    [defaultTheme.breakpoints.up("md")]: {
      fontSize: defaultTheme.typography.pxToRem(18),
    },
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(16),
    fontWeight: 600,
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 600,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(16),
    fontWeight: 400,
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 400,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 400,
  },
  button: {
    fontWeight: 700,
    fontSize: defaultTheme.typography.pxToRem(14),
    lineHeight: 1.5,
  },
};
