"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";

import {
  useLearningCourseOutlineQuery,
  useLearningLessonDetailQuery,
} from "@/modules/learning-screen/operations/query";
import type { LearningLesson, LearningLessonSummary, LearningSectionOutline } from "@/modules/learning-screen/types";
import type { LessonProgressMap, StoredLessonProgress } from "@/modules/learning-screen/utils/progressStorage";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";

import LessonContentPanel from "./lesson-content/LessonContentPanel";
import LessonNavigator from "./lesson-content/LessonNavigator";

const createLessonLookup = (sections: LearningSectionOutline[]) => {
  const lookup = new Map<string, LearningLessonSummary>();
  for (const section of sections) {
    for (const lesson of section.lessons) {
      lookup.set(lesson.id, lesson);
    }
  }
  return lookup;
};

const LearningScreenSection = () => {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ?? null;
  const { id: studentId } = useUserOrganization((state) => state.currentEmployee);

  const { data, isLoading, isError, refetch } = useLearningCourseOutlineQuery(courseId, { enabled: Boolean(courseId) });

  const course = data?.course ?? null;
  const sections = useMemo(() => data?.sections ?? [], [data?.sections]);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonProgressMap, setLessonProgressMap] = useState<LessonProgressMap>({});

  const lessonLookup = useMemo(() => createLessonLookup(sections), [sections]);
  const flatLessons = useMemo(() => Array.from(lessonLookup.values()), [lessonLookup]);

  useEffect(() => {
    setLessonProgressMap({});
  }, [courseId, studentId]);

  useEffect(() => {
    setSelectedLessonId(null);
  }, [courseId]);

  useEffect(() => {
    if (!flatLessons.length) {
      setSelectedLessonId(null);
      return;
    }

    setSelectedLessonId((current) => {
      if (current && lessonLookup.has(current)) {
        return current;
      }
      return flatLessons[0]?.id ?? null;
    });
  }, [flatLessons, lessonLookup]);

  const updateLessonProgress = useCallback(
    (lessonId: string, updater: (prev?: StoredLessonProgress) => StoredLessonProgress) => {
      if (!lessonId) {
        return;
      }
      setLessonProgressMap((prev) => ({
        ...prev,
        [lessonId]: updater(prev[lessonId]),
      }));
    },
    [setLessonProgressMap],
  );

  useEffect(() => {
    if (!selectedLessonId) {
      return;
    }
    updateLessonProgress(selectedLessonId, (prev) => {
      const timestamp = new Date().toISOString();
      return {
        ...(prev ?? { lastVisitedAt: timestamp }),
        lastVisitedAt: timestamp,
      };
    });
  }, [selectedLessonId, updateLessonProgress]);

  const selectedLessonSummary = selectedLessonId ? lessonLookup.get(selectedLessonId) ?? null : null;

  const {
    data: selectedLessonDetail,
    isLoading: isLessonLoading,
    isFetching: isLessonFetching,
    isError: isLessonError,
    error: lessonError,
    refetch: refetchLessonDetail,
  } = useLearningLessonDetailQuery(selectedLessonId, {
    enabled: Boolean(selectedLessonId),
  });

  const selectedLesson = selectedLessonDetail ?? null;
  const lessonErrorMessage = isLessonError
    ? lessonError instanceof Error
      ? lessonError.message
      : "Không thể tải dữ liệu bài học."
    : null;
  const isLessonRequestLoading = (isLessonLoading || isLessonFetching) && Boolean(selectedLessonId);

  const selectedLessonProgress: StoredLessonProgress | null = selectedLessonId
    ? lessonProgressMap[selectedLessonId] ?? null
    : null;

  const persistVideoProgress = useCallback(
    (lessonId: string, payload: { position: number; duration?: number }) => {
      if (!lessonId) return;
      const timestamp = new Date().toISOString();
      updateLessonProgress(lessonId, (prev) => ({
        ...(prev ?? { lastVisitedAt: timestamp }),
        lastVisitedAt: timestamp,
        video: {
          position: payload.position,
          duration: payload.duration,
          updatedAt: timestamp,
        },
      }));
    },
    [updateLessonProgress],
  );

  const persistDocumentProgress = useCallback(
    (lessonId: string, payload: { page: number; totalPages?: number; zoom?: number }) => {
      if (!lessonId) return;
      const timestamp = new Date().toISOString();
      updateLessonProgress(lessonId, (prev) => ({
        ...(prev ?? { lastVisitedAt: timestamp }),
        lastVisitedAt: timestamp,
        document: {
          page: payload.page,
          totalPages: payload.totalPages,
          zoom: payload.zoom,
          updatedAt: timestamp,
        },
      }));
    },
    [updateLessonProgress],
  );

  const toggleLessonCompletion = useCallback(
    (lessonId: string, completed: boolean) => {
      if (!lessonId) return;
      const timestamp = new Date().toISOString();
      updateLessonProgress(lessonId, (prev) => ({
        ...(prev ?? { lastVisitedAt: timestamp }),
        lastVisitedAt: timestamp,
        completed,
      }));
    },
    [updateLessonProgress],
  );

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      if (!lessonId || lessonId === selectedLessonId) {
        return;
      }
      setSelectedLessonId(lessonId);
    },
    [selectedLessonId],
  );

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
          lessonProgress={selectedLessonProgress}
          orderedLessons={flatLessons}
          selectedLessonSummary={selectedLessonSummary}
          isLessonLoading={isLessonRequestLoading}
          lessonError={lessonErrorMessage}
          onRetryLesson={refetchLessonDetail}
          onSelectLesson={handleSelectLesson}
          onPersistVideoProgress={persistVideoProgress}
          onPersistDocumentProgress={persistDocumentProgress}
          onToggleCompletion={toggleLessonCompletion}
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
            progressMap={lessonProgressMap}
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default LearningScreenSection;
