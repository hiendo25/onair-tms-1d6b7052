"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import type {
  CourseRow,
  LearningLesson,
  LearningLessonSummary,
} from "@/modules/learning-screen/types";
import { inferLessonContentKind } from "@/modules/learning-screen/utils/resource";

import AssessmentLessonFrame from "./AssessmentLessonFrame";
import AttachmentsList from "./AttachmentsList";
import DocumentLessonViewer from "./DocumentLessonViewer";
import ScormLessonViewer from "./ScormLessonViewer";
import VideoLessonPlayer from "./VideoLessonPlayer";

const DESCRIPTION_COLLAPSED_HEIGHT = 320;

interface LessonContentPanelProps {
  course: CourseRow;
  lesson: LearningLesson | null;
  orderedLessons: LearningLessonSummary[];
  selectedLessonSummary: LearningLessonSummary | null;
  onSelectLesson: (lessonId: string) => void;
  studentId: string | null;
  isLessonLoading: boolean;
  lessonError: string | null;
  onRetryLesson?: () => void;
  learningPathId?: string | null;
  classRoomId?: string | null;
}

const LessonContentPanel = ({
  course,
  lesson,
  orderedLessons,
  selectedLessonSummary,
  onSelectLesson,
  studentId,
  isLessonLoading,
  lessonError,
  onRetryLesson,
  learningPathId,
  classRoomId,
}: LessonContentPanelProps) => {
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [canExpandDescription, setCanExpandDescription] = useState(false);
  const courseDescription = lesson?.content ?? "";

  useEffect(() => {
    setIsDescriptionExpanded(false);
    const element = descriptionRef.current;

    if (!element || !courseDescription.trim()) {
      setCanExpandDescription(false);
      return;
    }

    const updateOverflowState = () => {
      if (!descriptionRef.current) {
        return;
      }
      const shouldEnableToggle =
        descriptionRef.current.scrollHeight > DESCRIPTION_COLLAPSED_HEIGHT + 8;
      setCanExpandDescription(shouldEnableToggle);
    };

    updateOverflowState();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateOverflowState());
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [courseDescription]);

  if (isLessonLoading) {
    return (
      <Box className="rounded-3xl border border-[#EFF0F3] bg-white p-6 shadow-sm">
        <Stack spacing={2} alignItems="center" justifyContent="center" minHeight={240}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Đang tải nội dung bài học...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (lessonError) {
    return (
      <Box className="rounded-3xl border border-[#FFE4E6] bg-white p-6 shadow-sm">
        <Alert
          severity="error"
          action={
            onRetryLesson ? (
              <Button color="inherit" size="small" onClick={() => onRetryLesson()}>
                Thử lại
              </Button>
            ) : null
          }
        >
          {selectedLessonSummary?.title
            ? `Không thể tải "${selectedLessonSummary.title}". Vui lòng thử lại.`
            : "Không thể tải dữ liệu bài học. Vui lòng thử lại."}
          <Typography variant="caption" display="block" color="text.secondary">
            {lessonError}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box className="rounded-3xl border border-[#EFF0F3] bg-white p-6 shadow-sm">
        <Typography variant="h6" gutterBottom>
          Khoá học {course.title ?? ""}
        </Typography>
        <Typography color="text.secondary">
          Hãy chọn một bài giảng ở danh sách bên phải để bắt đầu học.
        </Typography>
      </Box>
    );
  }

  const lessonIndex = orderedLessons.findIndex((item) => item.id === lesson.id);
  const prevLesson = orderedLessons[lessonIndex - 1] ?? null;
  const nextLesson = orderedLessons[lessonIndex + 1] ?? null;
  const contentKind = inferLessonContentKind(lesson);

  const renderLessonContent = () => {
    if (contentKind === "video") {
      return (
        <VideoLessonPlayer
          resource={lesson.mainResource ?? null}
          lesson={lesson}
          onRequestNextLesson={nextLesson ? () => onSelectLesson(nextLesson.id) : undefined}
          nextLessonTitle={nextLesson?.title ?? null}
          learningPathId={learningPathId}
          classRoomId={classRoomId}
          courseId={course.id}
          studentId={studentId}
        />
      );
    }

    if (contentKind === "pdf" || contentKind === "document" || contentKind === "text") {
      const documentKind =
        contentKind === "pdf" ? "pdf" : contentKind === "text" ? "text" : "document";
      return (
        <DocumentLessonViewer
          lesson={lesson}
          resource={lesson.mainResource ?? null}
          contentKind={documentKind}
          learningPathId={learningPathId}
          classRoomId={classRoomId}
          courseId={course.id}
          studentId={studentId}
          selectedLessonSummary={selectedLessonSummary}
        />
      );
    }

    if (contentKind === "scorm") {
      return (
        <ScormLessonViewer
          resource={lesson.mainResource ?? null}
          lesson={lesson}
          learningPathId={learningPathId}
          classRoomId={classRoomId}
          courseId={course.id}
          studentId={studentId}
          selectedLessonSummary={selectedLessonSummary}
        />
      );
    }

    if (contentKind === "assessment") {
      const assignmentBankId = lesson.assignment_id;
      return (
        <AssessmentLessonFrame
          assignmentId={assignmentBankId}
          studentId={studentId}
          lesson={lesson}
          learningPathId={learningPathId}
          classRoomId={classRoomId}
          courseId={course.id}
          selectedLessonSummary={selectedLessonSummary}
        />
      );
    }

    return (
      <Alert severity="info">
        Chưa hỗ trợ loại nội dung này. Vui lòng liên hệ quản trị viên để được hỗ trợ.
      </Alert>
    );
  };

  return (
    <Stack spacing={2}>
      <Box>
        {renderLessonContent()}
      </Box>

      <Box className="rounded-[28px] border border-[#EFF0F3] bg-white p-6 shadow-sm">
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              {course.title ?? "Khoá học eLearning"}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {lesson.title ?? "Bài giảng"}
            </Typography>
          </Stack>

          {lesson.content ? (
            <Stack spacing={1}>
              <Box
                ref={descriptionRef}
                sx={(theme) => ({
                  color: "text.secondary",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  position: "relative",
                  "& p": { marginBottom: 1.5 },
                  "& h1, & h2, & h3, & h4": {
                    color: "text.primary",
                    fontWeight: 600,
                    marginTop: 2,
                    marginBottom: 1,
                  },
                  "& ul, & ol": {
                    paddingLeft: 3,
                    marginBottom: 1.5,
                  },
                  "& li": {
                    marginBottom: 0.5,
                  },
                  "& a": {
                    color: "primary.main",
                    textDecoration: "underline",
                    fontWeight: 500,
                  },
                  "& blockquote": {
                    borderLeft: "4px solid #E0E7FF",
                    paddingLeft: 2,
                    color: "text.primary",
                    fontStyle: "italic",
                  },
                  "& code": {
                    backgroundColor: "#F4F5F7",
                    borderRadius: 1,
                    padding: "0.1rem 0.3rem",
                    fontSize: "0.9em",
                    color: "#0F172A",
                  },
                  "& pre": {
                    backgroundColor: "#0F172A",
                    color: "#E2E8F0",
                    padding: 2,
                    borderRadius: 2,
                    overflowX: "auto",
                  },
                  ...(canExpandDescription && !isDescriptionExpanded
                    ? {
                      maxHeight: DESCRIPTION_COLLAPSED_HEIGHT,
                      overflow: "hidden",
                    }
                    : {}),
                })}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {courseDescription}
                </ReactMarkdown>

                {canExpandDescription && !isDescriptionExpanded ? (
                  <Box
                    sx={(theme) => ({
                      position: "absolute",
                      inset: "auto 0 0 0",
                      height: 80,
                      pointerEvents: "none",
                      background: `linear-gradient(180deg, ${alpha(
                        theme.palette.background.paper,
                        0,
                      )} 0%, ${theme.palette.background.paper} 90%)`,
                    })}
                  />
                ) : null}
              </Box>

              {canExpandDescription ? (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  sx={{ alignSelf: "flex-start", paddingX: 0 }}
                >
                  {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                </Button>
              ) : null}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Nội dung bài giảng đang được cập nhật.
            </Typography>
          )}

          {lesson.attachments?.length ? (
            <>
              <Divider />
              <AttachmentsList
                attachments={lesson.attachments}
                mainResourceId={lesson.mainResource?.id}
              />
            </>
          ) : null}

          <Divider />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            justifyContent="flex-start"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack direction="row" spacing={1}>
              {prevLesson ? (
                <Button variant="outlined" onClick={() => onSelectLesson(prevLesson.id)}>
                  Bài trước
                </Button>
              ) : null}
              {nextLesson ? (
                <Button variant="outlined" onClick={() => onSelectLesson(nextLesson.id)}>
                  Bài tiếp
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default LessonContentPanel;
