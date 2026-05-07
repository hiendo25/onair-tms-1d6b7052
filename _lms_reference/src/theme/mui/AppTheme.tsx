"use client";
import * as React from "react";
import { viVN as coreViVN } from "@mui/material/locale";
import { viVN as textLocal } from "@mui/material/locale";
import type { ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { viVN as dataGridViVN } from "@mui/x-data-grid/locales";
import { viVN as dateViVN } from "@mui/x-date-pickers/locales";

import {
  buttonsCustomizations,
  cardsCustomizations,
  chartsCustomizations,
  checkboxCustomizations,
  dataDisplayCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  feedbackCustomizations,
  inputsCustomizations,
  navigationCustomizations,
  popoverCustomizations,
  selectsCustomizations,
  surfacesCustomizations,
  tabsCustomization,
  toggleButtonsCustomizations,
  treeViewCustomizations,
  typographyCustomizations,
} from "./customizations";
import { colorSchemes, shadows, shape, typography } from "./themePrimitives";

interface AppThemeProps {
  children: React.ReactNode;
  themeComponents?: ThemeOptions["components"];
}

const theme = createTheme(
  {
    cssVariables: {
      colorSchemeSelector: "data-mui-color-scheme",
      cssVarPrefix: "template",
    },
    colorSchemes,
    typography,
    shadows,
    shape,
    components: {
      ...inputsCustomizations,
      ...dataDisplayCustomizations,
      ...feedbackCustomizations,
      ...navigationCustomizations,
      ...surfacesCustomizations,
      ...chartsCustomizations,
      ...dataGridCustomizations,
      ...datePickersCustomizations,
      ...treeViewCustomizations,
      ...typographyCustomizations,
      ...selectsCustomizations,
      ...buttonsCustomizations,
      ...toggleButtonsCustomizations,
      ...tabsCustomization,
      ...checkboxCustomizations,
      ...popoverCustomizations,
      ...cardsCustomizations,
    },
  },
  dateViVN,
  dataGridViVN,
  coreViVN,
  textLocal,
);
export { theme };
