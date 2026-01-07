"use client";
import { Box, Card, Stack, Typography } from "@mui/material";

import { SECTION_CARD_SX } from "@/modules/learning-paths/components/learning-path-detail.utils";
import type {
  HighlightPhaseSummary,
  LearningPathProgressSummary,
  PhaseTimelineItem,
} from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import ExpandableDescription from "../ExpandableDescription";

import {
  buildCompletionBannerData,
  buildPhaseHighlightSummary,
} from "./learning-path-user.utils";
import LearningPathCompletionBanner from "./LearningPathCompletionBanner";
import LearningPathHighlightSummaryCard from "./LearningPathHighlightSummaryCard";
import LearningPathPhaseTimeline from "./LearningPathPhaseTimeline";

const HERO_IMAGE_HEIGHT = { xs: 180, md: 240 };
const HERO_IMAGE_RADIUS = 3;
const HERO_IMAGE_OVERLAY = "rgba(15, 23, 42, 0.18)";
const HERO_FALLBACK_BG = "linear-gradient(120deg, #1D4ED8 0%, #60A5FA 100%)";
const HERO_CONTENT_PADDING = { xs: 2.5, md: 3 };

export interface LearningPathUserDetailViewProps {
  learningPath: LearningPathWithDetails;
  timelineItems: PhaseTimelineItem[];
  progressSummary: LearningPathProgressSummary;
  highlightPhaseSummary: HighlightPhaseSummary | null;
}

export default function LearningPathUserDetailView({
  learningPath,
  timelineItems,
  progressSummary,
  highlightPhaseSummary,
}: LearningPathUserDetailViewProps) {
  const highlightSummary = buildPhaseHighlightSummary(highlightPhaseSummary);
  const completionBanner = buildCompletionBannerData(learningPath, progressSummary);

  const heroBackground = learningPath.thumbnail_url
    ? `url(${learningPath.thumbnail_url})`
    : HERO_FALLBACK_BG;

  return (
    <Stack spacing={4}>
      <Card sx={{ ...SECTION_CARD_SX, borderRadius: HERO_IMAGE_RADIUS }}>
        <Box sx={{ p: HERO_CONTENT_PADDING }}>
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
        </Box>
      </Card>

      <Card sx={{ ...SECTION_CARD_SX, borderRadius: HERO_IMAGE_RADIUS }}>
        <Box sx={{ p: HERO_CONTENT_PADDING }}>
          {!completionBanner && <LearningPathHighlightSummaryCard summary={highlightSummary} />}
          <LearningPathCompletionBanner banner={completionBanner} />
          <LearningPathPhaseTimeline items={timelineItems} />
        </Box>
      </Card>
    </Stack>
  );
}
