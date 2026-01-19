"use client";

import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { getPhaseLabel } from "@/modules/learning-paths/components/learning-path-detail.utils";
import { LearningPathPhaseDetailView } from "@/modules/learning-paths/components/view-user";
import { useGetPhaseById } from "@/modules/learning-paths/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

interface LearningPathPhaseDetailContentProps {
  phaseId: string;
}

export default function LearningPathPhaseDetailContent({
  phaseId,
}: LearningPathPhaseDetailContentProps) {
  const router = useRouter();
  const {
    data: phaseDetailData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetPhaseById(phaseId);
  const phaseDetail = phaseDetailData?.data ?? null;
  const detailData = phaseDetail?.detailData ?? null;
  const phase = detailData?.phase ?? null;
  const hasDetail = Boolean(detailData && phase);
  const learningPathName = phaseDetail?.learningPath?.name ?? "Lộ trình học tập";
  const learningPathId = phaseDetail?.learningPath?.id ?? null;
  const phaseBreadcrumbLabel = phase ? getPhaseLabel(phase, 0) : "Chi tiết giai đoạn";

  const isLoadingContent = isLoading;
  const errorMessage =
    error instanceof Error ? error.message : "Không thể tải giai đoạn học tập. Vui lòng thử lại.";

  if (isLoadingContent && !hasDetail) {
    return (
      <PageContainer
        title="Đang tải giai đoạn"
        breadcrumbs={[
          { title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT },
          { title: phaseBreadcrumbLabel },
        ]}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (error && !hasDetail) {
    return (
      <PageContainer
        title="Không thể tải giai đoạn"
        breadcrumbs={[{ title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT }]}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h6">Không thể tải giai đoạn học tập</Typography>
            <Typography variant="body2" color="text.secondary">
              {errorMessage}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="contained" onClick={() => refetch()} disabled={isFetching}>
                Thử lại
              </Button>
              <Button variant="outlined" onClick={() => router.push(PATHS.MY_LEARNING_PATHS.ROOT)}>
                Quay lại lộ trình
              </Button>
            </Stack>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (!phaseDetail) {
    return (
      <PageContainer
        title="Giai đoạn học tập"
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

  if (!detailData || !phase) {
    return (
      <PageContainer
        title="Không tìm thấy giai đoạn"
        breadcrumbs={[
          { title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT },
          { title: phaseBreadcrumbLabel },
        ]}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="body1">Không tìm thấy giai đoạn phù hợp.</Typography>
            <Button variant="contained" onClick={() => router.push(PATHS.MY_LEARNING_PATHS.ROOT)}>
              Quay lại lộ trình
            </Button>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Chi tiết giai đoạn"
      breadcrumbs={[
        { title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT },
        { title: phaseBreadcrumbLabel },
      ]}
    >
      <LearningPathPhaseDetailView
        learningPathName={learningPathName}
        learningPathId={learningPathId}
        detailData={detailData}
        onBack={() => router.push(PATHS.MY_LEARNING_PATHS.ROOT)}
      />
    </PageContainer>
  );
}
