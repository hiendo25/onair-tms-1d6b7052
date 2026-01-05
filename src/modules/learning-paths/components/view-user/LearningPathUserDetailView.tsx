"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Box, Card, Chip, LinearProgress, Stack, Typography } from "@mui/material";

import { getSettingsItems } from "@/modules/learning-paths/components/learning-path-detail.utils";
import type { LearningPathProgressSummary, PhaseTimelineItem } from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { parseMetadata } from "@/repository/learning-paths/transformers";

import LearningPathPhaseTimeline from "./LearningPathPhaseTimeline";

const PROGRESS_CARD_SHADOW = "0 24px 50px rgba(15, 23, 42, 0.12)";
const PROGRESS_BAR_GRADIENT =
  "linear-gradient(90deg, #2563EB 0%, #4F46E5 55%, #16A34A 100%)";

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
  const metadata = parseMetadata(learningPath.metadata);
  const settingsItems = getSettingsItems(metadata);
  const remainingPhases = Math.max(0, progressSummary.totalPhases - progressSummary.completedPhases);

  return (
    <Stack spacing={4}>
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid rgba(109, 106, 106, 0.2)",
          boxShadow: PROGRESS_CARD_SHADOW,
          bgcolor: "transparent",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                Tiến độ lộ trình
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Hoàn thành {progressSummary.overallProgress}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {progressSummary.completedPhases}/{progressSummary.totalPhases} giai đoạn
                </Typography>
              </Stack>
              {learningPath.description ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {learningPath.description}
                </Typography>
              ) : null}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Mốc hoàn thành: {progressSummary.completionCriteria}%
                </Typography>
                {progressSummary.isCompletionReached ? (
                  <Chip
                    size="small"
                    color="success"
                    icon={<CheckCircleRoundedIcon />}
                    label="Đã đạt"
                    variant="outlined"
                  />
                ) : null}
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressSummary.overallProgress}
              sx={{
                height: 12,
                borderRadius: 999,
                bgcolor: "rgba(255, 255, 255, 0.6)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundImage: PROGRESS_BAR_GRADIENT,
                },
              }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Giai đoạn đã hoàn thành
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {progressSummary.completedPhases}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Giai đoạn còn lại
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {remainingPhases}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Tổng số giai đoạn
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {progressSummary.totalPhases}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Card>

      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
              Thiết lập lộ trình
            </Typography>
            <Stack spacing={1.5}>
              {settingsItems.map((item) => (
                <Stack key={item.label} direction="row" spacing={1.5} alignItems="flex-start">
                  <CheckCircleRoundedIcon sx={{ color: "primary.main", fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Card>

      <LearningPathPhaseTimeline items={timelineItems} />
    </Stack>
  );
}
