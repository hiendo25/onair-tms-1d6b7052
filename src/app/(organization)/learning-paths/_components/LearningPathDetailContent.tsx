"use client";

import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import LearningPathDetailView from "@/modules/learning-paths/components/LearningPathDetailView";
import { useGetCurrentLearningPath } from "@/modules/learning-paths/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

export default function LearningPathDetailContent() {
  const router = useRouter();
  const { data: currentLearningPathData, isLoading, error } = useGetCurrentLearningPath();

  const learningPath = currentLearningPathData?.data ?? null;

  if (isLoading) {
    return (
      <PageContainer
        title="Đang tải lộ trình"
        breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS }]}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (error || !learningPath) {
    return (
      <PageContainer
        title="Lộ trình học tập"
        breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS }]}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h6">Bạn chưa được gán vào lộ trình học tập nào</Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng liên hệ quản trị viên để được hỗ trợ.
            </Typography>
            <Button variant="contained" onClick={() => router.push(PATHS.DASHBOARD)}>
              Về trang chủ
            </Button>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={learningPath.name}
      breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS }]}
    >
      <LearningPathDetailView learningPath={learningPath} showSettings={false} showAudience={false} />
    </PageContainer>
  );
}
