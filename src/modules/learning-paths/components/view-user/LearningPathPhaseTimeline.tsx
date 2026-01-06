"use client";

import { Box, Card, Stack, Typography } from "@mui/material";

import { PhaseTimelineItem } from "../../types";

import LearningPathPhaseTimelineItem from "./LearningPathPhaseTimelineItem";

const TIMELINE_LINE_WIDTH = 3;
const TIMELINE_NODE_RADIUS = 44;
const TIMELINE_BG = "linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(239, 246, 255, 0.9))";

export interface LearningPathPhaseTimelineProps {
  items: PhaseTimelineItem[];
}

export default function LearningPathPhaseTimeline({ items }: LearningPathPhaseTimelineProps) {
  if (items.length === 0) {
    return (
      <Box sx={{ px: 2, py: 4, textAlign: "center", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có giai đoạn nào trong lộ trình.
        </Typography>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={700}>
            Các giai đoạn học tập
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lộ trình được chia thành {items.length} giai đoạn để theo dõi tiến độ dễ dàng.
          </Typography>
        </Stack>

        <Box
          sx={{
            position: "relative",
            borderRadius: 2,
            px: { xs: 1, md: 3 },
            py: { xs: 3, md: 4 },
            bgcolor: "transparent",
            backgroundImage: TIMELINE_BG,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top, rgba(37, 99, 235, 0.08), transparent 55%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 24,
              bottom: 24,
              left: { xs: TIMELINE_NODE_RADIUS, md: "50%" },
              width: TIMELINE_LINE_WIDTH,
              backgroundImage: "linear-gradient(180deg, rgba(37, 99, 235, 0.35), rgba(16, 185, 129, 0.35))",
              borderRadius: 999,
              transform: { xs: "none", md: "translateX(-50%)" },
            }}
          />

          <Stack spacing={{ xs: 4, md: 6 }} sx={{ position: "relative", zIndex: 1 }}>
            {items.map((item, index) => (
              <LearningPathPhaseTimelineItem
                key={item.phase.id}
                item={item}
                index={index}
                align={index % 2 === 0 ? "left" : "right"}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
