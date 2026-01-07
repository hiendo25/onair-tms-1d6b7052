"use client";

import { useMemo } from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { SECTION_CARD_SX } from "@/modules/learning-paths/components/learning-path-detail.utils";
import { PhaseTimelineItem } from "../../types";

import { buildRoadMapData, getCurrentStepIndex } from "./roadmap-data.utils";
import RoadMapSVG from "./RoadMapSvg";

const ROADMAP_CONTAINER_MAX_WIDTH = 1320;
const EMPTY_STATE_BORDER = "1px dashed";
const EMPTY_STATE_RADIUS = 2;
const TIMELINE_CARD_RADIUS = 3;

export interface LearningPathPhaseTimelineProps {
  items: PhaseTimelineItem[];
}

export default function LearningPathPhaseTimeline({ items }: LearningPathPhaseTimelineProps) {
  const router = useRouter();

  const mapData = useMemo(() => buildRoadMapData(items), [items]);
  const currentStepIndex = useMemo(() => getCurrentStepIndex(items), [items]);
  const phaseLinks = useMemo(
    () => items.map((item) => PATHS.MY_LEARNING_PATHS.PHASE_DETAIL(item.phase.id)),
    [items],
  );

  if (items.length === 0) {
    return (
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
    );
  }

  return (
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
  );
}
