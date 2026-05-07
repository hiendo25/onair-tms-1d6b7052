"use client";
import React from "react";
import { LocalizationProvider as XDateLocationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { viVN } from "@mui/x-date-pickers/locales";

const MUILocalizationProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <XDateLocationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="vi-VN"
      localeText={{
        ...viVN.components.MuiLocalizationProvider.defaultProps.localeText,
        clearButtonLabel: "Xóa",
      }}
    >
      {children}
    </XDateLocationProvider>
  );
};
export default MUILocalizationProvider;
