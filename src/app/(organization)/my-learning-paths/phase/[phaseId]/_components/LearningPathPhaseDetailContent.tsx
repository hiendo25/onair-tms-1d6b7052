"use client";

import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { getPhaseLabel } from "@/modules/learning-paths/components/learning-path-detail.utils";
import {
  useGetClassRoomsProgress,
  useGetPhaseById,
  useGetPhaseProgress,
} from "@/modules/learning-paths/operations/query";
import { LearningPathPhaseDetailView } from "@/modules/learning-paths/view-user";
import PageContainer from "@/shared/ui/PageContainer";

interface LearningPathPhaseDetailContentProps {
  phaseId: string;
}

export default function LearningPathPhaseDetailContent({
  phaseId,
}: LearningPathPhaseDetailContentProps) {
  const router = useRouter();
  const { data: phaseDetailData, isLoading, error } = useGetPhaseById(phaseId);
  const phaseDetail = phaseDetailData?.data ?? null;
  const phase = phaseDetail?.phase ?? null;
  const learningPathId = phase?.learning_path_id ?? null;
  const learningPathName = phaseDetail?.learningPath?.name ?? "Lộ trình học tập";
  const phaseBreadcrumbLabel = phase ? getPhaseLabel(phase, 0) : "Chi tiết giai đoạn";

  const { data: phaseProgress, isLoading: isLoadingPhaseProgress } = useGetPhaseProgress(phaseId, {
    enabled: !!phaseId,
  });

  const classRoomIds = Array.from(
    new Set(phase?.phase_class_rooms?.map((classRoomItem) => classRoomItem.class_room.id) ?? [])
  );

  const { data: classRoomsProgress, isLoading: isLoadingClassRoomsProgress } = useGetClassRoomsProgress(
    classRoomIds,
    learningPathId,
    {
      enabled: !!classRoomIds.length,
    }
  );

  const isLoadingContent = isLoading || isLoadingPhaseProgress || isLoadingClassRoomsProgress;

  if (isLoadingContent) {
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

  if (error || !phaseDetail) {
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

  if (!phase) {
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
      breadcrumbs={[
        { title: "Lộ trình học tập", path: PATHS.MY_LEARNING_PATHS.ROOT },
        { title: phaseBreadcrumbLabel },
      ]}
    >
      <LearningPathPhaseDetailView
        learningPathName={learningPathName}
        phase={phase}
        phaseProgress={phaseProgress ?? null}
        classRoomsProgress={classRoomsProgress ?? []}
        onBack={() => router.push(PATHS.MY_LEARNING_PATHS.ROOT)}
      />
    </PageContainer>
  );
}
