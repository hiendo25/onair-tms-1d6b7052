"use client";

import { useMemo } from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { getPhaseLabel, SECTION_CARD_SX } from "@/modules/learning-paths/components/learning-path-detail.utils";
import { PHASE_STATUS } from "../../learning-path-user.constants";
import { PhaseTimelineItem } from "../../types";

import RoadMapSVG from "./RoadMapSvg";

const EMPTY_DESCRIPTION = "Chưa có mô tả cho giai đoạn này.";
const ROADMAP_CONTAINER_MAX_WIDTH = 1320;
const EMPTY_STATE_BORDER = "1px dashed";
const EMPTY_STATE_RADIUS = 2;
const TIMELINE_CARD_RADIUS = 3;

export interface LearningPathPhaseTimelineProps {
  items: PhaseTimelineItem[];
}

const buildMapData = (items: PhaseTimelineItem[]) =>
  items.map((item, index) => ({
    title: getPhaseLabel(item.phase, index),
    content: item.phase.description || EMPTY_DESCRIPTION,
    orderIndex: item.orderIndex ?? index + 1,
    status: item.status,
    progressPercentage: item.progressPercentage,
  }));

const getCurrentStepIndex = (items: PhaseTimelineItem[]): number => {
  if (items.length === 0) return -1;

  const activeIndex = items.findIndex((item) => item.status === PHASE_STATUS.ACTIVE);
  if (activeIndex >= 0) return activeIndex;

  const allCompleted = items.every((item) => item.status === PHASE_STATUS.COMPLETED);
  if (allCompleted) return items.length;

  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items?.[index]?.status === PHASE_STATUS.COMPLETED) {
      return index;
    }
  }

  return -1;
};

export default function LearningPathPhaseTimeline({ items }: LearningPathPhaseTimelineProps) {
  const router = useRouter();

  const mapData = useMemo(() => buildMapData(items), [items]);
  const currentStepIndex = useMemo(() => getCurrentStepIndex(items), [items]);
  const phaseLinks = useMemo(
    () => items.map((item) => PATHS.MY_LEARNING_PATHS.PHASE_DETAIL(item.phase.id)),
    [items],
  );

  if (items.length === 0) {
    return (
      <Card sx={{ ...SECTION_CARD_SX, borderRadius: TIMELINE_CARD_RADIUS }}>
        <Box
          sx={{
            px: 2,
            py: 4,
            textAlign: "center",
            borderRadius: EMPTY_STATE_RADIUS,
            border: EMPTY_STATE_BORDER,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Chưa có giai đoạn nào trong lộ trình.
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        ...SECTION_CARD_SX,
        borderRadius: TIMELINE_CARD_RADIUS,
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2} sx={{ p: { xs: 1, md: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: { xs: "100%", lg: ROADMAP_CONTAINER_MAX_WIDTH } }}>
            <RoadMapSVG
              data={mapData}
              currentStepIndex={currentStepIndex}
              onPressPeriod={(index) => {
                if (index < 0 || index >= phaseLinks.length) return;
                router.push(phaseLinks?.[index]!);
              }}
              onPressPeriodLocked={() => { }}
            />
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
