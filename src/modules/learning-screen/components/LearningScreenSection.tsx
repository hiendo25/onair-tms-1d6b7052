"use client";

import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";

import { useLearningScreenState } from "@/modules/learning-screen/hooks/useLearningScreenState";

import LessonContentPanel from "./lesson-content/LessonContentPanel";
import LessonNavigator from "./lesson-content/LessonNavigator";

interface LearningScreenSectionProps {
  courseId: string | null;
}

const LearningScreenSection = ({ courseId }: LearningScreenSectionProps) => {
  const {
    course,
    sections,
    isLoading,
    isError,
    refetch,
    flatLessons,
    selectedLessonId,
    selectedLessonSummary,
    selectedLesson,
    isLessonRequestLoading,
    lessonErrorMessage,
    refetchLessonDetail,
    handleSelectLesson,
    studentId,
    isLearningPathSource,
    sectionProgressById,
  } = useLearningScreenState({
    courseId,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Đang tải thông tin khoá học...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Thử lại
          </Button>
        }
      >
        Không thể tải dữ liệu khoá học. Vui lòng thử lại sau.
      </Alert>
    );
  }

  if (!course) {
    return <Alert severity="warning">Không tìm thấy khoá học. Vui lòng quay lại danh sách lớp học.</Alert>;
  }

  if (!sections.length) {
    return <Alert severity="info">Khoá học hiện chưa có nội dung bài giảng. Vui lòng quay lại sau.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 2.3fr) minmax(340px, 1fr)",
          },
        }}
      >
        <LessonContentPanel
          course={course}
          lesson={selectedLesson}
          orderedLessons={flatLessons}
          selectedLessonSummary={selectedLessonSummary}
          isLessonLoading={isLessonRequestLoading}
          lessonError={lessonErrorMessage}
          onRetryLesson={refetchLessonDetail}
          onSelectLesson={handleSelectLesson}
          studentId={studentId}
        />

        <Box
          sx={{
            position: { lg: "sticky" },
            top: { lg: 24 },
          }}
        >
          <LessonNavigator
            sections={sections}
            selectedLessonId={selectedLessonId}
            onSelectLesson={handleSelectLesson}
            showSectionProgress={isLearningPathSource}
            sectionProgressById={sectionProgressById}
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default LearningScreenSection;
