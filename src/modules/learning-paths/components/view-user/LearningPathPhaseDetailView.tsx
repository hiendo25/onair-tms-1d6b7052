"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Card, Grid, IconButton, LinearProgress, Stack, Typography } from "@mui/material";

import { getPhaseLabel } from "@/modules/learning-paths/components/learning-path-detail.utils";
import { PhaseDetailData } from "../../types";
import ExpandableDescription from "../ExpandableDescription";

import LearningPathPhaseClassRoomCard from "./LearningPathPhaseClassRoomCard";

const PHASE_PROGRESS_CARD_BG = "rgba(189, 190, 193, 0.08)";
const DEFAULT_PHASE_DESCRIPTION = "Chưa có mô tả cho giai đoạn này.";

export interface LearningPathPhaseDetailViewProps {
  learningPathName: string;
  detailData: PhaseDetailData;
  onBack?: () => void;
}

export default function LearningPathPhaseDetailView({
  learningPathName,
  detailData,
  onBack,
}: LearningPathPhaseDetailViewProps) {
  const phaseLabel = getPhaseLabel(detailData.phase, 0);

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
          <ExpandableDescription
            text={detailData.phase.description}
            fallbackText={DEFAULT_PHASE_DESCRIPTION}
          />
        </Stack>
      </Stack>

      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "#cccc",
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
