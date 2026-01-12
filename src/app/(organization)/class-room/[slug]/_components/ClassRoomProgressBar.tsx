"use client";

import { Box, LinearProgress, Stack, Typography } from "@mui/material";

interface ClassRoomProgressBarProps {
  value: number;
  size: "md" | "sm" | "xs",
}

const calculateSize = (size: "md" | "sm" | "xs") => {
  if (size === "md") {
    return 16
  }
  if (size === "sm") {
    return 14
  }
  if (size === "xs") {
    return 12
  }

  return 12;
}

export default function ClassRoomProgressBar({
  value,
  size,
}: ClassRoomProgressBarProps) {
  const sizeValue = calculateSize(size)
  return (
    <Box sx={{ position: "relative", mt: 2 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: sizeValue,
          borderRadius: sizeValue,
          bgcolor: "#ACDAFF",
          "& .MuiLinearProgress-bar": {
            borderRadius: sizeValue,
            backgroundColor: "#2196F5",
            boxShadow: "inset 0 -4px 4px 0 rgba(0, 0, 0, 0.16)",
          },
        }}
      />
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        {value}%
      </Typography>
    </Box>
  );
}
