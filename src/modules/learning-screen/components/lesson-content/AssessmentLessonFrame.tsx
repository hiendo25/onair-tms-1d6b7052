import { Alert, Stack, Typography } from "@mui/material";

import AssignmentSubmission from "@/app/(organization)/admin/assignments/[id]/submit/[employeeId]/_components/AssignmentSubmission";
import { PATHS } from "@/constants/path.constant";
import type { LearningLesson, LearningLessonSummary } from "@/modules/learning-screen/types";
import MarkLessonCompleteButton from "../MarkLessonCompleteButton";

interface AssessmentLessonFrameProps {
  assignmentId: string | null;
  studentId: string | null;
  lesson: LearningLesson;
  learningPathId?: string | null;
  courseId?: string | null;
  selectedLessonSummary?: LearningLessonSummary | null;
}

const AssessmentLessonFrame = ({
  assignmentId,
  studentId,
  lesson,
  learningPathId,
  courseId,
  selectedLessonSummary,
}: AssessmentLessonFrameProps) => {
  if (!assignmentId) {
    return <Alert severity="warning">Chưa gắn bài kiểm tra cho bài học này.</Alert>;
  }

  if (!studentId) {
    return <Alert severity="warning">Không xác định được thông tin người học. Vui lòng đăng nhập lại.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Bài kiểm tra sẽ tự động nộp khi hết thời gian làm bài (nếu có quy định giới hạn).
      </Typography>

      <AssignmentSubmission
        assignmentId={assignmentId}
        employeeId={studentId}
        basePath={PATHS.MY_ASSIGNMENTS.ROOT}
        variant="embedded"
      />

      <MarkLessonCompleteButton
        lessonId={lesson.id}
        learningPathId={learningPathId}
        courseId={courseId}
        studentId={studentId}
        selectedLessonSummary={selectedLessonSummary}
      />
    </Stack>
  );
};

export default AssessmentLessonFrame;
