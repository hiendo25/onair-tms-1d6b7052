"use client";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box, Stack, Typography } from "@mui/material";

import type { CompletionBannerData } from "./learning-path-user.utils";

const COMPLETION_CONTAINER_BG = "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)";
const COMPLETION_CONTAINER_BORDER = "1px solid rgba(251, 191, 36, 0.35)";
const COMPLETION_BANNER_BG = "rgba(255, 255, 255, 0.9)";
const COMPLETION_BANNER_SHADOW = "0 12px 28px rgba(15, 23, 42, 0.08)";
const COMPLETION_ICON_BG = "#FDE68A";
const COMPLETION_ICON_COLOR = "#F59E0B";
const COMPLETION_ICON_SIZE = 64;

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
        bgcolor: COMPLETION_CONTAINER_BG,
        border: COMPLETION_CONTAINER_BORDER,
        p: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          bgcolor: COMPLETION_BANNER_BG,
          boxShadow: COMPLETION_BANNER_SHADOW,
          p: { xs: 2.5, md: 3 },
          textAlign: "center",
        }}
      >
        <Stack spacing={1} alignItems="center">
          <Box
            sx={{
              width: COMPLETION_ICON_SIZE,
              height: COMPLETION_ICON_SIZE,
              borderRadius: "50%",
              bgcolor: COMPLETION_ICON_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StarRoundedIcon sx={{ color: COMPLETION_ICON_COLOR, fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {banner.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {banner.subtitle}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
