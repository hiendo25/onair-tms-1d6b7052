"use client";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box, Stack, Typography } from "@mui/material";

import ProgressBar from "@/shared/ui/ProgressBar";

import type { PhaseHighlightSummary } from "./learning-path-user.utils";

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


        <ProgressBar value={summary.progressPercentage} />
      </Stack>
    </Box>
  );
}
