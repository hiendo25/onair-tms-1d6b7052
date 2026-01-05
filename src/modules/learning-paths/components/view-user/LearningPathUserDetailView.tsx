"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Box, Card, Chip, LinearProgress, Stack, Typography } from "@mui/material";

import {
  getSettingsItems,
  SECTION_CARD_SX,
} from "@/modules/learning-paths/components/learning-path-detail.utils";
import type { LearningPathProgressSummary, PhaseTimelineItem } from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { parseMetadata } from "@/repository/learning-paths/transformers";
import ExpandableDescription from "../ExpandableDescription";

import LearningPathPhaseTimeline from "./LearningPathPhaseTimeline";

const SUMMARY_ITEM_BG = "rgba(248, 250, 252, 0.9)";
const SUMMARY_ITEM_BORDER = "1px solid rgba(15, 23, 42, 0.08)";
const SETTINGS_BULLET_SIZE = 6;
const SETTINGS_BULLET_COLOR = "primary.main";

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
  const summaryItems = [
    {
      id: "completed",
      label: "Đã hoàn thành",
      value: progressSummary.completedPhases,
    },
    {
      id: "remaining",
      label: "Còn lại",
      value: remainingPhases,
    },
    {
      id: "total",
      label: "Tổng số",
      value: progressSummary.totalPhases,
    },
  ];

  return (
    <Stack spacing={4}>
      <Card
        sx={{
          ...SECTION_CARD_SX,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  Tiến độ lộ trình
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
              <Typography variant="h5" fontWeight={700}>
                Hoàn thành {progressSummary.overallProgress}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progressSummary.completedPhases}/{progressSummary.totalPhases} giai đoạn • Mốc hoàn
                thành {progressSummary.completionCriteria}%
              </Typography>
              <ExpandableDescription text={learningPath.description} />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progressSummary.overallProgress}
              sx={{
                height: 10,
                borderRadius: 999,
                bgcolor: "grey.100",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {summaryItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: SUMMARY_ITEM_BG,
                    border: SUMMARY_ITEM_BORDER,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Card>

      <Card
        sx={{
          ...SECTION_CARD_SX,
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
              Thiết lập lộ trình
            </Typography>
            <Stack spacing={1.5}>
              {settingsItems.map((item) => (
                <Stack key={item.label} direction="row" spacing={1.5} alignItems={"center"}>
                  <Box
                    sx={{
                      width: SETTINGS_BULLET_SIZE,
                      height: SETTINGS_BULLET_SIZE,
                      borderRadius: "50%",
                      bgcolor: SETTINGS_BULLET_COLOR,
                      mt: 0.9,
                      flexShrink: 0,
                    }}
                  />
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
