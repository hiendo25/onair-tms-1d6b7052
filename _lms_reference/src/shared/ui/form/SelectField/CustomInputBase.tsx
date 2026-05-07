"use client";
import { InputBase } from "@mui/material";
import { styled } from "@mui/material";
import { inputBaseClasses } from "@mui/material";

export const CustomBaseInput = styled(InputBase)(({ theme }) => ({
  border: `1px solid`,
  borderColor: theme.palette.grey[400],
  borderRadius: theme.shape.borderRadius,
  fontSize: theme.typography.fontSize,
  "&::hover": {
    borderColor: theme.palette.grey[600],
  },
  [`&.${inputBaseClasses.focused}`]: {
    borderColor: theme.palette.primary.main,
  },
  [`&.${inputBaseClasses.error}`]: {
    borderColor: theme.palette.error.main,
  },
}));
