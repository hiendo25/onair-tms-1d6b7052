import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type {
  CourseRow,
  LearningLesson,
} from "@/modules/learning-screen/types";
import type { StoredLessonProgress } from "@/modules/learning-screen/utils/progressStorage";
import { inferLessonContentKind } from "@/modules/learning-screen/utils/resource";
import VideoLessonPlayer from "./lesson-content/VideoLessonPlayer";
import DocumentLessonViewer from "./lesson-content/DocumentLessonViewer";
import ScormLessonViewer from "./lesson-content/ScormLessonViewer";
import AssessmentLessonFrame from "./lesson-content/AssessmentLessonFrame";
import AttachmentsList from "./lesson-content/AttachmentsList";

interface LessonContentPanelProps {
  course: CourseRow;
  lesson: LearningLesson | null;
  lessonProgress: StoredLessonProgress | null;
  orderedLessons: LearningLesson[];
  onSelectLesson: (lessonId: string) => void;
  onPersistVideoProgress: (lessonId: string, payload: { position: number; duration?: number }) => void;
  onPersistDocumentProgress: (
    lessonId: string,
    payload: { page: number; totalPages?: number; zoom?: number },
  ) => void;
  onToggleCompletion: (lessonId: string, completed: boolean) => void;
  courseId: string | null;
  studentId: string | null;
}

const LessonContentPanel = ({
  course,
  lesson,
  lessonProgress,
  orderedLessons,
  onSelectLesson,
  onPersistVideoProgress,
  onPersistDocumentProgress,
  onToggleCompletion,
  studentId,
}: LessonContentPanelProps) => {
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
  const isCompleted = Boolean(lessonProgress?.completed);
  const contentKind = inferLessonContentKind(lesson);

  const renderLessonContent = () => {
    if (contentKind === "video") {
      return (
        <VideoLessonPlayer
          resource={lesson.mainResource ?? null}
          lesson={lesson}
          lessonProgress={lessonProgress}
          onProgressChange={(payload) => onPersistVideoProgress(lesson.id, payload)}
          onToggleCompletion={(completed) => onToggleCompletion(lesson.id, completed)}
          onRequestNextLesson={nextLesson ? () => onSelectLesson(nextLesson.id) : undefined}
          nextLessonTitle={nextLesson?.title ?? null}
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
          lessonProgress={lessonProgress}
          onProgressChange={(payload) => onPersistDocumentProgress(lesson.id, payload)}
          onToggleCompletion={(completed) => onToggleCompletion(lesson.id, completed)}
        />
      );
    }

    if (contentKind === "scorm") {
      return (
        <ScormLessonViewer
          resource={lesson.mainResource ?? null}
          onToggleCompletion={(completed) => onToggleCompletion(lesson.id, completed)}
        />
      );
    }

    if (contentKind === "assessment") {
      const assignmentId = lesson.assignment?.id ?? lesson.main_resource ?? null;
      return (
        <AssessmentLessonFrame
          assignmentId={assignmentId}
          studentId={studentId}
          onToggleCompletion={(completed) => onToggleCompletion(lesson.id, completed)}
        />
      );
    }

    return (
      <Alert severity="info">
        Chưa hỗ trợ loại nội dung này. Vui lòng liên hệ quản trị viên để được hỗ trợ.
      </Alert>
    );
  };

  const statusLabel = isCompleted
    ? "Đã hoàn thành"
    : lessonProgress?.video || lessonProgress?.document
      ? "Đang học"
      : "Chưa học";
  const statusColor = isCompleted ? "success" : lessonProgress?.video ? "warning" : "default";

  return (
    <Stack
      spacing={3}
      className="rounded-3xl border border-[#EFF0F3] bg-white p-5 shadow-sm"
    >
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          {course.title ?? "Khoá học eLearning"}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {lesson.title ?? "Bài giảng"}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip label={statusLabel} color={statusColor as any} size="small" />
          <Chip label={contentKind.toUpperCase()} variant="outlined" size="small" />
          {lessonProgress?.lastVisitedAt ? (
            <Typography variant="caption" color="text.secondary">
              Lần cuối: {dayjs(lessonProgress.lastVisitedAt).format("DD/MM/YYYY HH:mm")}
            </Typography>
          ) : null}
        </Stack>
      </Stack>

      <Typography variant="body1" color="text.secondary">
        {lesson.content
          ? lesson.content.replace(/<[^>]*>?/gm, "")
          : "Nội dung bài giảng đang được cập nhật."}
      </Typography>

      {renderLessonContent()}

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
        justifyContent="space-between"
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

        <Button
          variant={isCompleted ? "outlined" : "contained"}
          color={isCompleted ? "success" : "primary"}
          onClick={() => onToggleCompletion(lesson.id, !isCompleted)}
        >
          {isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default LessonContentPanel;
