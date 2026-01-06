"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import LearningPathDetailView from "@/modules/learning-paths/components/LearningPathDetailView";
import { useGetLearningPathQuery } from "@/modules/learning-paths/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

interface LearningPathDetailContentProps {
  learningPathId: string;
}

export default function LearningPathDetailContent({ learningPathId }: LearningPathDetailContentProps) {
  const { data, isLoading, isError, error } = useGetLearningPathQuery(learningPathId);
  const learningPath = data?.data ?? null;

  if (isLoading) {
    return (
      <PageContainer
        title="Đang tải lộ trình"
        breadcrumbs={[
          { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
          { title: "Chi tiết", path: PATHS.LEARNING_PATHS.DETAIL(learningPathId) },
        ]}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (isError || !learningPath) {
    return (
      <PageContainer
        title="Không tìm thấy lộ trình"
        breadcrumbs={[
          { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
          { title: "Chi tiết", path: PATHS.LEARNING_PATHS.DETAIL(learningPathId) },
        ]}
      >
        <Box sx={{ p: 3 }}>
          <Typography>
            {error instanceof Error ? error.message : "Không tìm thấy lộ trình học tập."}
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={learningPath.name}
      breadcrumbs={[
        { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
        { title: learningPath.name, path: PATHS.LEARNING_PATHS.DETAIL(learningPathId) },
      ]}
    >
      <LearningPathDetailView learningPath={learningPath} />
    </PageContainer>
  );
}
