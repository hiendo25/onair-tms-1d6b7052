"use client";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box, Card, LinearProgress, Stack, Typography } from "@mui/material";

import { SECTION_CARD_SX } from "@/modules/learning-paths/components/learning-path-detail.utils";
import type { LearningPathProgressSummary, PhaseTimelineItem } from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import ExpandableDescription from "../ExpandableDescription";
import LearningPathChip from "../LearningPathChip";

import {
  buildCompletionBannerData,
  buildLearningPathHeroTags,
  buildPhaseHighlightSummary,
} from "./learning-path-user.utils";
import LearningPathPhaseTimeline from "./LearningPathPhaseTimeline";

const HERO_IMAGE_HEIGHT = { xs: 180, md: 240 };
const HERO_IMAGE_RADIUS = 3;
const HERO_IMAGE_OVERLAY = "rgba(15, 23, 42, 0.18)";
const HERO_FALLBACK_BG = "linear-gradient(120deg, #1D4ED8 0%, #60A5FA 100%)";
const HERO_CONTENT_PADDING = { xs: 2.5, md: 3 };

const SUMMARY_CARD_BG = "rgba(248, 250, 252, 0.92)";
const SUMMARY_BAR_HEIGHT = 12;
const SUMMARY_BAR_RADIUS = 999;
const SUMMARY_BAR_TRACK = "rgba(59, 130, 246, 0.12)";
const SUMMARY_BAR_GRADIENT = "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)";
const SUMMARY_LABEL_COLOR = "#1D4ED8";
const SUMMARY_ICON_COLOR = "#64748B";
const SUMMARY_TITLE_LINE_CLAMP = 2;

const COMPLETION_CONTAINER_BG = "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)";
const COMPLETION_CONTAINER_BORDER = "1px solid rgba(251, 191, 36, 0.35)";
const COMPLETION_BANNER_BG = "rgba(255, 255, 255, 0.9)";
const COMPLETION_BANNER_SHADOW = "0 12px 28px rgba(15, 23, 42, 0.08)";
const COMPLETION_ICON_BG = "#FDE68A";
const COMPLETION_ICON_COLOR = "#F59E0B";
const COMPLETION_ICON_SIZE = 64;

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
  const heroTags = buildLearningPathHeroTags(learningPath, progressSummary);
  const highlightSummary = buildPhaseHighlightSummary(timelineItems);
  const completionBanner = buildCompletionBannerData(learningPath, progressSummary);

  const heroBackground = learningPath.thumbnail_url
    ? `url(${learningPath.thumbnail_url})`
    : HERO_FALLBACK_BG;

  const timelineSection = <LearningPathPhaseTimeline items={timelineItems} />;

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
            {heroTags.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {heroTags.map((tag) => (
                  <LearningPathChip key={tag.id} label={tag.label} />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Card>

      {highlightSummary ? (
        <Card sx={{ ...SECTION_CARD_SX, bgcolor: SUMMARY_CARD_BG }}>
          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
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
                    {highlightSummary.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {highlightSummary.subtitle}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StarRoundedIcon sx={{ color: SUMMARY_ICON_COLOR, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {highlightSummary.classRoomLabel}
                  </Typography>
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {highlightSummary.remainingLabel}
              </Typography>

              <Box sx={{ position: "relative" }}>
                <LinearProgress
                  variant="determinate"
                  value={highlightSummary.progressPercentage}
                  sx={{
                    height: SUMMARY_BAR_HEIGHT,
                    borderRadius: SUMMARY_BAR_RADIUS,
                    bgcolor: SUMMARY_BAR_TRACK,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: SUMMARY_BAR_RADIUS,
                      backgroundImage: SUMMARY_BAR_GRADIENT,
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
                  {highlightSummary.progressPercentage}%
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>
      ) : null}

      {completionBanner ? (
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: COMPLETION_CONTAINER_BG,
            border: COMPLETION_CONTAINER_BORDER,
            p: { xs: 2, md: 3 },
          }}
        >
          <Stack spacing={2}>
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
                  {completionBanner.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completionBanner.subtitle}
                </Typography>
              </Stack>
            </Box>
            {timelineSection}
          </Stack>
        </Box>
      ) : (
        timelineSection
      )}
    </Stack>
  );
}
