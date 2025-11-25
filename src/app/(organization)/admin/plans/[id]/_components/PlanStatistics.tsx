"use client";

import * as React from "react";
import { Box, Typography } from "@mui/material";

interface PlanStatisticsProps {
  programsCount: number;
  topicsCount: number;
  coursesCount: number;
  instructorsCount: number;
}

export default function PlanStatistics({
  programsCount,
  topicsCount,
  coursesCount,
  instructorsCount,
}: PlanStatisticsProps) {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "white",
        borderRadius: 1,
        display: "flex",
        justifyContent: "center",
        gap: 12,
        mb: 3,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {programsCount}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Chương trình
        </Typography>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {topicsCount}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Chủ đề
        </Typography>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {coursesCount}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Môn học
        </Typography>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {instructorsCount}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Giảng viên
        </Typography>
      </Box>
    </Box>
  );
}

