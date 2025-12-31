"use client";

import { useMemo } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Card, Grid, IconButton, LinearProgress, Stack, Typography } from "@mui/material";

import { getPhaseLabel } from "@/modules/learning-paths/components/learning-path-detail.utils";
import type { PhaseWithClassRooms } from "@/repository/learning-paths";
import type { ProgressResponse } from "@/types/progress.types";

import { buildPhaseDetailData } from "./learning-path-phase.utils";
import LearningPathPhaseClassRoomCard from "./LearningPathPhaseClassRoomCard";

const PHASE_PROGRESS_CARD_BG = "rgba(59, 130, 246, 0.08)";

export interface LearningPathPhaseDetailViewProps {
  learningPathName: string;
  phase: PhaseWithClassRooms;
  phaseProgress?: ProgressResponse | null;
  classRoomsProgress?: ProgressResponse[] | null;
  onBack?: () => void;
}

export default function LearningPathPhaseDetailView({
  learningPathName,
  phase,
  phaseProgress = null,
  classRoomsProgress = null,
  onBack,
}: LearningPathPhaseDetailViewProps) {
  const detailData = useMemo(() => {
    return buildPhaseDetailData(phase, phaseProgress, classRoomsProgress ?? []);
  }, [phase, phaseProgress, classRoomsProgress]);

  const phaseLabel = getPhaseLabel(phase, 0);
  const phaseDescription = phase.description || "Chưa có mô tả cho giai đoạn này.";

  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <IconButton
          onClick={onBack}
          aria-label={`Quay lại ${learningPathName}`}
          sx={{ mt: 0.5 }}
          disabled={!onBack}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontWeight={700}>
            {phaseLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {phaseDescription}
          </Typography>
        </Stack>
      </Stack>

      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "primary.100",
          bgcolor: PHASE_PROGRESS_CARD_BG,
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={600}>
                Tiến độ giai đoạn
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {detailData.summary.progressPercentage}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={detailData.summary.progressPercentage}
              sx={{
                height: 10,
                borderRadius: 999,
                bgcolor: "primary.100",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {detailData.summary.completedClassRooms}/{detailData.summary.totalClassRooms} lớp học đã hoàn thành
            </Typography>
          </Stack>
        </Box>
      </Card>

      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={700}>
          Danh sách lớp học ({detailData.summary.totalClassRooms})
        </Typography>
        {detailData.classRooms.length === 0 ? (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">Chưa có lớp học nào trong giai đoạn này.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {detailData.classRooms.map((classRoom) => (
              <Grid key={classRoom.id} size={{ xs: 12, md: 6 }}>
                <LearningPathPhaseClassRoomCard item={classRoom} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Stack>
  );
}
