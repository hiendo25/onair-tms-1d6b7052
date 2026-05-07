import { Alert, Stack, Typography } from "@mui/material";

import AssignmentSubmission from "@/app/(organization)/admin/assignments/[id]/submit/[employeeId]/_components/AssignmentSubmission";
import { PATHS } from "@/constants/path.constant";
import { useGetAssignmentConfigByCourseQuery } from "@/modules/assignment-management/operations/query";
import { useMarkLessonComplete } from "@/modules/learning-screen/hooks/useMarkLessonComplete";
import type { LearningLesson, LearningLessonSummary } from "@/modules/learning-screen/types";

interface AssessmentLessonFrameProps {
  assignmentId: string | null;
  studentId: string | null;
  lesson: LearningLesson;
  learningPathId?: string | null;
  classRoomId?: string | null;
  courseId?: string | null;
  selectedLessonSummary?: LearningLessonSummary | null;
}

const AssessmentLessonFrame = ({
  assignmentId,
  studentId,
  lesson,
  learningPathId,
  classRoomId,
  courseId,
  selectedLessonSummary,
}: AssessmentLessonFrameProps) => {
  const {
    data: assignmentConfigId,
    isLoading: isLoadingAssignmentConfig,
  } = useGetAssignmentConfigByCourseQuery(courseId ?? undefined, assignmentId ?? undefined);
  const { markComplete } = useMarkLessonComplete({
    courseId: courseId ?? null,
    learningPathId,
    classRoomId,
    employeeId: studentId ?? null,
  });

  if (!assignmentId) {
    return <Alert severity="warning">Chưa gắn bài kiểm tra cho bài học này.</Alert>;
  }

  if (!studentId) {
    return <Alert severity="warning">Không xác định được thông tin người học. Vui lòng đăng nhập lại.</Alert>;
  }

  if (!courseId) {
    return <Alert severity="warning">Không xác định được thông tin môn học.</Alert>;
  }

  if (isLoadingAssignmentConfig) {
    return <Alert severity="info">Đang tải cấu hình bài kiểm tra...</Alert>;
  }

  if (!assignmentConfigId) {
    return <Alert severity="warning">Chưa cấu hình bài kiểm tra cho môn học này.</Alert>;
  }

  const handleAssignmentSubmitted = () => {
    if (learningPathId || classRoomId) {
      markComplete(lesson.id);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Bài kiểm tra sẽ tự động nộp khi hết thời gian làm bài (nếu có quy định giới hạn).
      </Typography>

      <AssignmentSubmission
        assignmentId={assignmentConfigId}
        employeeId={studentId}
        basePath={PATHS.MY_ASSIGNMENTS.ROOT}
        variant="embedded"
        onSubmitted={handleAssignmentSubmitted}
      />
    </Stack>
  );
};

export default AssessmentLessonFrame;
