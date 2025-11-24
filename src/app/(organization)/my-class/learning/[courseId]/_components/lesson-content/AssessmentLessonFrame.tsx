import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

interface AssessmentLessonFrameProps {
  assignmentId: string | null;
  studentId: string | null;
  onToggleCompletion: (completed: boolean) => void;
}

const AssessmentLessonFrame = ({
  assignmentId,
  studentId,
  onToggleCompletion,
}: AssessmentLessonFrameProps) => {
  if (!assignmentId) {
    return <Alert severity="warning">Chưa gắn bài kiểm tra cho bài học này.</Alert>;
  }

  if (!studentId) {
    return (
      <Alert severity="warning">
        Không xác định được thông tin người học. Vui lòng đăng nhập lại.
      </Alert>
    );
  }

  const submissionUrl = `/assignments/${assignmentId}/submit/${studentId}?embed=learning`;

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Bài kiểm tra sẽ tự động nộp khi hết thời gian làm bài (nếu có quy định giới hạn).
      </Typography>
      <Box className="h-[520px] overflow-hidden rounded-2xl border border-[#EFF0F3]">
        <iframe
          src={submissionUrl}
          title="Assignment submission"
          className="h-full w-full border-0"
        />
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="outlined"
          onClick={() => window.open(submissionUrl, "_blank")}
        >
          Mở toàn màn hình
        </Button>
        <Button variant="contained" onClick={() => onToggleCompletion(true)}>
          Đánh dấu đã hoàn thành
        </Button>
      </Stack>
    </Stack>
  );
};

export default AssessmentLessonFrame;
