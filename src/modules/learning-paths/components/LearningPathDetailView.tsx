"use client";

import * as React from "react";
import { Box, Card, Grid, Stack, Typography } from "@mui/material";

import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { parseMetadata } from "@/repository/learning-paths/transformers";

import {
  getAssignmentModeLabel,
  getSettingsItems,
  SECTION_CARD_SX,
} from "./learning-path-detail.utils";
import LearningPathChip from "./LearningPathChip";
import LearningPathDetailAudienceSection from "./LearningPathDetailAudienceSection";
import LearningPathDetailPhasesSection from "./LearningPathDetailPhasesSection";
import LearningPathDetailSettingsSection from "./LearningPathDetailSettingsSection";

interface LearningPathDetailViewProps {
  learningPath: LearningPathWithDetails;
  showSettings?: boolean;
  showAudience?: boolean;
}

export default function LearningPathDetailView({
  learningPath,
  showSettings = true,
  showAudience = true,
}: LearningPathDetailViewProps) {
  const metadata = parseMetadata(learningPath.metadata);
  const settingsItems = React.useMemo(() => getSettingsItems(metadata), [metadata]);
  const assignmentModeLabel = getAssignmentModeLabel(metadata);
  const phases = learningPath.learning_path_phases ?? [];
  const participants = learningPath.employee_learning_paths ?? [];
  const hasSideSections = showSettings || showAudience;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: hasSideSections ? 8 : 12 }}>
        <Stack spacing={3}>
          <Card sx={SECTION_CARD_SX}>
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  height: { xs: 180, md: 220 },
                  mb: 2.5,
                  position: "relative",
                  bgcolor: "primary.main",
                  backgroundImage: learningPath.thumbnail_url
                    ? `url(${learningPath.thumbnail_url})`
                    : "linear-gradient(120deg, #1D4ED8 0%, #60A5FA 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(15, 23, 42, 0.2)",
                  }}
                />
              </Box>

              <Stack spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Ngày phát hành{" "}
                    <LearningPathChip label={learningPath.created_at
                      ? fDateTime(learningPath.created_at, FORMAT_DATE_TIME_CLEANER)
                      : "—"} />
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {learningPath.name}
                  </Typography>
                  {learningPath.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="max-h-40 overflow-scroll"
                    >
                      {learningPath.description}
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <LearningPathChip label={assignmentModeLabel} />
                  <LearningPathChip label={`${phases.length} giai đoạn`} />
                  <LearningPathChip label={`${participants.length} học viên`} />
                </Stack>
              </Stack>
            </Box>
          </Card>
          <LearningPathDetailPhasesSection phases={phases} />
        </Stack>
      </Grid>

      {hasSideSections && (
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {showSettings && <LearningPathDetailSettingsSection items={settingsItems} />}
            {showAudience && <LearningPathDetailAudienceSection employees={participants} />}
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}
