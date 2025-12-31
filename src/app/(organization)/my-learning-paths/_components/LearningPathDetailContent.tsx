"use client";

import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import {
  useGetCurrentLearningPath,
  useGetLearningPathPhasesProgress,
  useGetLearningPathProgress,
  useGetLearningPathQuery,
} from "@/modules/learning-paths/operations/query";
import { LearningPathUserDetailView } from "@/modules/learning-paths/view-user";
import PageContainer from "@/shared/ui/PageContainer";

export default function LearningPathDetailContent() {
  const router = useRouter();
  const { data: currentLearningPathData, isLoading, error } = useGetCurrentLearningPath();

  const learningPath = currentLearningPathData?.data ?? null;
  const learningPathId = learningPath?.id ?? null;

  const { data: LearningPathPhases, isError } = useGetLearningPathQuery(learningPathId!);

  const { data: learningPathProgress, isLoading: isLoadingProgress } = useGetLearningPathProgress(
    learningPathId,
    {
      enabled: !!learningPathId,
    }
  );
  const { data: phasesProgress, isLoading: isLoadingPhasesProgress } =
    useGetLearningPathPhasesProgress(learningPathId, {
      enabled: !!learningPathId,
    });

  const isLoadingContent = isLoading || (learningPathId ? isLoadingProgress || isLoadingPhasesProgress : false);

  if (isLoadingContent) {
    return (
      <PageContainer
        title="Đang tải lộ trình"
        breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT }]}
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
        breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT }]}
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
      breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT }]}
    >
      <LearningPathUserDetailView
        learningPath={LearningPathPhases?.data!}
        learningPathProgress={learningPathProgress ?? null}
        phasesProgress={phasesProgress ?? []}
      />
    </PageContainer>
  );
}
