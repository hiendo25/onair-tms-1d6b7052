"use client";

import * as React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, SxProps, TextField, Theme } from "@mui/material";

interface SearchTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
  maxWidth?: SxProps<Theme>["maxWidth"];
}

const SearchTextField = ({
  value,
  onChange,
  placeholder = "Tìm kiếm",
  size = "medium",
  sx,
  maxWidth = { md: 320 },
}: SearchTextFieldProps) => {
  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      size={size}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      sx={{
        maxWidth,
        "& .MuiOutlinedInput-root": {
          backgroundColor: "grey.200",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
        ...sx,
      }}
    />
  );
};

export default React.memo(SearchTextField);
