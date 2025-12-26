"use client";

import { useEffect } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useGetCurrentLearningPath } from "@/modules/learning-paths/operations/query";

const LearningPathsPage = () => {
  const router = useRouter();
  const { data: currentLearningPathData, isLoading, error } = useGetCurrentLearningPath();

  useEffect(() => {
    if (!isLoading && !currentLearningPathData?.data) {
      // If no current learning path, redirect to dashboard
      router.push(PATHS.DASHBOARD);
    }
  }, [isLoading, currentLearningPathData, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Đang tải thông tin lộ trình học tập...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !currentLearningPathData?.data) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5" color="text.primary">
            Bạn chưa được gán vào lộ trình học tập nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(PATHS.DASHBOARD)}
          >
            Về trang chủ
          </Button>
        </Stack>
      </Box>
    );
  }

  const learningPath = currentLearningPathData.data;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={700}>
          Lộ trình học tập của bạn
        </Typography>

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid #EFF0F3",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={600}>
              {learningPath.name}
            </Typography>
            {learningPath.description && (
              <Typography variant="body1" color="text.secondary">
                {learningPath.description}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default LearningPathsPage;
