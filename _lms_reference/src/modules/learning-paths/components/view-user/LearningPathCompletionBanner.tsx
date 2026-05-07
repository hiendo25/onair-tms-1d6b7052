"use client";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box, Stack, Typography } from "@mui/material";

import StarCompleted from "@/shared/assets/icons/phase-detail/StarCompleted";

import type { CompletionBannerData } from "./learning-path-user.utils";

const COMPLETION_CONTAINER_BG = "linear-gradient(180deg, #FFFFFF 0%, #FFDD82 100%)";
const COMPLETION_CONTAINER_BORDER = "1px solid rgba(251, 191, 36, 0.35)";
const COMPLETION_BANNER_BG = "linear-gradient(180deg, #FFFFFF 0%, #FFDD82 100%)";
const COMPLETION_BANNER_SHADOW = "0 12px 28px rgba(15, 23, 42, 0.08)";

export interface LearningPathCompletionBannerProps {
  banner: CompletionBannerData | null;
}

export default function LearningPathCompletionBanner({
  banner,
}: LearningPathCompletionBannerProps) {
  if (!banner) return null;

  return (
    <Box
      sx={{
        borderRadius: 3,
        backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #FFDD82 100%)",
        p: { xs: 2.5, md: 3 },
        textAlign: "center",
        mb: 2.5
      }}
    >
      <Stack spacing={1} alignItems="center">
        <StarCompleted className="text-[200px]" />
        <Typography variant="h6" fontWeight={700}>
          {banner.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {banner.subtitle}
        </Typography>
      </Stack>
    </Box>
  );
}
