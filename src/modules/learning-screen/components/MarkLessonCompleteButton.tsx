"use client";

import { useCallback } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Stack, Typography } from "@mui/material";

import { useMarkLessonComplete } from "@/modules/learning-screen/hooks/useMarkLessonComplete";
import type { LearningLessonSummary } from "@/modules/learning-screen/types";

interface MarkLessonCompleteButtonProps {
  lessonId: string;
  learningPathId?: string | null;
  classRoomId?: string | null;
  courseId?: string | null;
  studentId?: string | null;
  selectedLessonSummary?: LearningLessonSummary | null;
  className?: string;
}

const MarkLessonCompleteButton = ({
  lessonId,
  learningPathId,
  classRoomId,
  courseId,
  studentId,
  selectedLessonSummary,
  className,
}: MarkLessonCompleteButtonProps) => {
  const { markComplete, isLoading: isMarkingComplete } = useMarkLessonComplete({
    courseId: courseId ?? null,
    learningPathId,
    classRoomId,
    employeeId: studentId ?? null,
  });

  const isCompleted = selectedLessonSummary?.progressStatus === "completed";
  const showCompleteButton = !isCompleted;

  const handleMarkComplete = useCallback(() => {
    console.log("[MarkLessonCompleteButton] Marking lesson as complete:", {
      lessonId,
      learningPathId,
      courseId,
      studentId,
    });

    markComplete(lessonId);
  }, [lessonId, learningPathId, courseId, studentId, markComplete]);

  // Show completion status if already completed
  if (isCompleted) {
    return (
      <Box
        className={className}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "success.main",
          alignSelf: "flex-end",
        }}
      >
        <CheckCircleIcon />
        <Typography variant="body2" fontWeight={600}>
          Bài học đã hoàn thành
        </Typography>
      </Box>
    );
  }

  // Show complete button if not yet completed
  if (showCompleteButton) {
    return (
      <Stack direction="row" spacing={2} className={className} sx={{ alignSelf: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CheckCircleIcon />}
          onClick={handleMarkComplete}
          disabled={isMarkingComplete}
        >
          {isMarkingComplete ? "Đang xử lý..." : "Đã hoàn thành"}
        </Button>
      </Stack>
    );
  }

  return null;
};

export default MarkLessonCompleteButton;
