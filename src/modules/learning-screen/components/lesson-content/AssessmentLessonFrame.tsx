import { Alert, Stack, Typography } from "@mui/material";

import AssignmentSubmission from "@/app/(organization)/admin/assignments/[id]/submit/[employeeId]/_components/AssignmentSubmission";
import { PATHS } from "@/constants/path.constant";
import { useMarkLessonComplete } from "@/modules/learning-screen/hooks/useMarkLessonComplete";
import type { LearningLesson, LearningLessonSummary } from "@/modules/learning-screen/types";

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
  const { markComplete } = useMarkLessonComplete({
    courseId: courseId ?? null,
    learningPathId,
    employeeId: studentId ?? null,
  });

  if (!assignmentId) {
    return <Alert severity="warning">Chưa gắn bài kiểm tra cho bài học này.</Alert>;
  }

  if (!studentId) {
    return <Alert severity="warning">Không xác định được thông tin người học. Vui lòng đăng nhập lại.</Alert>;
  }

  const handleAssignmentSubmitted = () => {
    // Automatically mark the lesson as complete when assignment is submitted
    if (learningPathId) {
      markComplete(lesson.id);
    }
  };

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
        onSubmitted={handleAssignmentSubmitted}
      />
    </Stack>
  );
};

export default AssessmentLessonFrame;
