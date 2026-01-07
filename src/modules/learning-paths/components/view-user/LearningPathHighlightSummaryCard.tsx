"use client";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";

import type { PhaseHighlightSummary } from "./learning-path-user.utils";

const SUMMARY_BAR_HEIGHT = 16;
const SUMMARY_BAR_RADIUS = 16;
const SUMMARY_BAR_TRACK = "#ACDAFF";
const SUMMARY_LABEL_COLOR = "#fff";
const SUMMARY_ICON_COLOR = "#64748B";
const SUMMARY_TITLE_LINE_CLAMP = 2;

export interface LearningPathHighlightSummaryCardProps {
  summary: PhaseHighlightSummary | null;
}

export default function LearningPathHighlightSummaryCard({
  summary,
}: LearningPathHighlightSummaryCardProps) {
  if (!summary) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid #DFE3E8", borderRadius: "16px" }}>
      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: SUMMARY_TITLE_LINE_CLAMP,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {summary.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {summary.subtitle}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {summary.remainingLabel}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <StarRoundedIcon sx={{ color: SUMMARY_ICON_COLOR, fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600}>
              {summary.classRoomLabel}
            </Typography>
          </Stack>
        </Stack>


        <Box sx={{ position: "relative" }}>
          <LinearProgress
            variant="determinate"
            value={summary.progressPercentage}
            sx={{
              height: SUMMARY_BAR_HEIGHT,
              borderRadius: SUMMARY_BAR_RADIUS,
              bgcolor: SUMMARY_BAR_TRACK,
              "& .MuiLinearProgress-bar": {
                borderRadius: SUMMARY_BAR_RADIUS,
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
              color: SUMMARY_LABEL_COLOR,
            }}
          >
            {summary.progressPercentage}%
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
