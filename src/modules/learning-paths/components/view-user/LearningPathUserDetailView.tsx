"use client";
import { Box, Card, Stack, Typography } from "@mui/material";

import { SECTION_CARD_SX } from "@/modules/learning-paths/components/learning-path-detail.utils";
import type { LearningPathProgressSummary, PhaseTimelineItem } from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import ExpandableDescription from "../ExpandableDescription";

import { buildCompletionBannerData } from "./learning-path-user.utils";
import LearningPathCompletionBanner from "./LearningPathCompletionBanner";
import LearningPathPhaseTimeline from "./LearningPathPhaseTimeline";
import LearningPathProgressBarSummary from "./LearningPathProgressBarSummary";

const HERO_IMAGE_HEIGHT = { xs: 180, md: 240 };
const HERO_IMAGE_RADIUS = 3;
const HERO_IMAGE_OVERLAY = "rgba(15, 23, 42, 0.18)";
const HERO_FALLBACK_BG = "linear-gradient(120deg, #1D4ED8 0%, #60A5FA 100%)";
const HERO_CONTENT_PADDING = { xs: 2.5, md: 3 };
const TIMELINE_CARD_SHADOW = "shadow-[0_8px_16px_0_rgba(145,158,171,0.16)]";

export interface LearningPathUserDetailViewProps {
  learningPath: LearningPathWithDetails;
  timelineItems: PhaseTimelineItem[];
  progressSummary: LearningPathProgressSummary;
}

export default function LearningPathUserDetailView({
  learningPath,
  timelineItems,
  progressSummary,
}: LearningPathUserDetailViewProps) {
  const completionBanner = buildCompletionBannerData(learningPath, progressSummary);

  const heroBackground = learningPath.thumbnail_url
    ? `url(${learningPath.thumbnail_url})`
    : HERO_FALLBACK_BG;

  return (
    <Card sx={{ ...SECTION_CARD_SX, p: HERO_CONTENT_PADDING }}>
      <Stack spacing={4}>
        <Box
          sx={{
            borderRadius: HERO_IMAGE_RADIUS,
            overflow: "hidden",
            height: HERO_IMAGE_HEIGHT,
            mb: 2.5,
            position: "relative",
            bgcolor: "primary.main",
            backgroundImage: heroBackground,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Box sx={{ position: "absolute", inset: 0, bgcolor: HERO_IMAGE_OVERLAY }} />
        </Box>

        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            {learningPath.name}
          </Typography>
          <ExpandableDescription text={learningPath.description} />
        </Stack>
        <Box
          sx={{
            backgroundImage: completionBanner
              ? "linear-gradient(81deg, #FFFFFF 0%, #FFE59F 100%)"
              : "none",
            bgcolor: completionBanner ? "transparent" : "common.white",
            p: completionBanner ? 3 : 0,
          }}
        >
          {!completionBanner && <LearningPathProgressBarSummary progressSummary={progressSummary} />}
          <LearningPathCompletionBanner banner={completionBanner} />
          <Card className={completionBanner ? TIMELINE_CARD_SHADOW : undefined}>
            <LearningPathPhaseTimeline items={timelineItems} />
          </Card>
        </Box>
      </Stack>
    </Card >
  );
}
