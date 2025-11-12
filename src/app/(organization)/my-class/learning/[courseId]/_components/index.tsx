"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useLearningCourseDetailQuery } from "@/modules/learning-screen/operations/query";
import type {
  LearningLesson,
  LearningSection,
} from "@/modules/learning-screen/types";
import LessonNavigator from "./lesson-navigator";
import LessonContentPanel from "./lesson-content-panel";
import {
  StoredCourseProgress,
  StoredLessonProgress,
  getCourseProgressState,
  markLessonCompleted,
  recordLessonVisit,
  updateLessonProgressState,
} from "@/modules/learning-screen/utils/progressStorage";

const createLessonLookup = (sections: LearningSection[]) => {
  const lookup = new Map<string, LearningLesson>();
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
  const studentId = useUserOrganization((state) => state.data.id);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useLearningCourseDetailQuery(courseId, { enabled: Boolean(courseId) });

  const course = data?.course ?? null;
  const sections = useMemo(() => data?.sections ?? [], [data?.sections]);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<StoredCourseProgress | null>(null);

  const lessonLookup = useMemo(() => createLessonLookup(sections), [sections]);
  const flatLessons = useMemo(() => Array.from(lessonLookup.values()), [lessonLookup]);

  const syncProgressState = useCallback((nextState: StoredCourseProgress | null) => {
    if (!nextState) {
      return;
    }
    setCourseProgress({
      ...nextState,
      lessons: { ...nextState.lessons },
    });
  }, []);

  useEffect(() => {
    if (!studentId || !courseId) {
      setCourseProgress(null);
      return;
    }
    const storedState = getCourseProgressState(studentId, courseId) ?? null;
    setCourseProgress(storedState);
  }, [studentId, courseId]);

  useEffect(() => {
    if (!flatLessons.length) {
      setSelectedLessonId(null);
      return;
    }

    setSelectedLessonId((current) => {
      if (current && lessonLookup.has(current)) {
        return current;
      }

      const storedLessonId = courseProgress?.lastLessonId;
      if (storedLessonId && lessonLookup.has(storedLessonId)) {
        return storedLessonId;
      }

      return flatLessons[0]?.id ?? null;
    });
  }, [flatLessons, lessonLookup, courseProgress?.lastLessonId]);

  useEffect(() => {
    if (!selectedLessonId) {
      return;
    }
    const nextState = recordLessonVisit(studentId, courseId, selectedLessonId);
    syncProgressState(nextState ?? null);
  }, [selectedLessonId, studentId, courseId, syncProgressState]);

  const selectedLesson = selectedLessonId ? lessonLookup.get(selectedLessonId) ?? null : null;

  const selectedLessonProgress: StoredLessonProgress | null = selectedLessonId
    ? courseProgress?.lessons[selectedLessonId] ?? null
    : null;

  const lessonProgressMap = courseProgress?.lessons ?? {};

  const persistVideoProgress = useCallback(
    (lessonId: string, payload: { position: number; duration?: number }) => {
      if (!lessonId) return;
      const nextState = updateLessonProgressState(studentId, courseId, lessonId, {
        video: payload,
      });
      syncProgressState(nextState ?? null);
    },
    [studentId, courseId, syncProgressState],
  );

  const persistDocumentProgress = useCallback(
    (
      lessonId: string,
      payload: { page: number; totalPages?: number; zoom?: number },
    ) => {
      if (!lessonId) return;
      const nextState = updateLessonProgressState(studentId, courseId, lessonId, {
        document: payload,
      });
      syncProgressState(nextState ?? null);
    },
    [studentId, courseId, syncProgressState],
  );

  const toggleLessonCompletion = useCallback(
    (lessonId: string, completed: boolean) => {
      if (!lessonId) return;
      const nextState = markLessonCompleted(studentId, courseId, lessonId, completed);
      syncProgressState(nextState ?? null);
    },
    [studentId, courseId, syncProgressState],
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
    return (
      <Alert severity="warning">
        Không tìm thấy khoá học. Vui lòng quay lại danh sách lớp học.
      </Alert>
    );
  }

  if (!sections.length) {
    return (
      <Alert severity="info">
        Khoá học hiện chưa có nội dung bài giảng. Vui lòng quay lại sau.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "grid",
          gap: 24,
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
          onSelectLesson={handleSelectLesson}
          onPersistVideoProgress={persistVideoProgress}
          onPersistDocumentProgress={persistDocumentProgress}
          onToggleCompletion={toggleLessonCompletion}
          courseId={courseId}
          studentId={studentId}
        />

        <LessonNavigator
          sections={sections}
          selectedLessonId={selectedLessonId}
          onSelectLesson={handleSelectLesson}
          progressMap={lessonProgressMap}
        />
      </Box>
    </Stack>
  );
};

export default LearningScreenSection;
