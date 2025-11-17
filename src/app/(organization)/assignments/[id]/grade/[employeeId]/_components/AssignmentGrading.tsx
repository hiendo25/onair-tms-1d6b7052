"use client";

import React, { useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useGetSubmissionDetailQuery } from "@/modules/assignment-management/operations/query";
import { useSaveGradeMutation } from "@/modules/assignment-management/operations/mutation";
import GradeQuestionCard from "./GradeQuestionCard";
import { QuestionGradeInput } from "@/types/dto/assignments";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { PATHS } from "@/constants/path.contstants";
import AssignmentSubmissionHeader from "../../../_components/AssignmentSubmissionHeader";

interface AssignmentGradingProps {
  assignmentId: string;
  employeeId: string;
}

interface GradeFormData {
  grades: Record<string, number | string>;
  feedbacks: Record<string, string>;
  overallFeedback: string;
}

const AssignmentGrading: React.FC<AssignmentGradingProps> = ({
  assignmentId,
  employeeId,
}) => {
  const router = useRouter();
  const notifications = useNotifications();
  const { data: submission, isLoading, error } = useGetSubmissionDetailQuery(assignmentId, employeeId);
  const saveGradeMutation = useSaveGradeMutation();

  const defaultGrades = useMemo(() => {
    if (!submission) return {};

    const initialGrades: Record<string, number | string> = {};
    submission.questions.forEach((q) => {
      if (!q.isAutoGraded) {
        initialGrades[q.id] = q.earnedScore ?? "";
      }
    });
    return initialGrades;
  }, [submission]);

  const defaultFeedbacks = useMemo(() => {
    if (!submission) return {};

    const initialFeedbacks: Record<string, string> = {};
    submission.questions.forEach((q) => {
      if (!q.isAutoGraded) {
        initialFeedbacks[q.id] = q.feedback ?? "";
      }
    });
    return initialFeedbacks;
  }, [submission]);

  const { control, handleSubmit, watch, reset, formState: { errors, isValid } } = useForm<GradeFormData>({
    mode: "onChange",
    defaultValues: {
      grades: defaultGrades,
      feedbacks: defaultFeedbacks,
      overallFeedback: submission?.feedback ?? "",
    },
  });

  useEffect(() => {
    if (submission) {
      reset({
        grades: defaultGrades,
        feedbacks: defaultFeedbacks,
        overallFeedback: submission.feedback ?? "",
      });
    }
  }, [submission, defaultGrades, defaultFeedbacks, reset]);

  const grades = watch("grades");

  // Create a stable dependency by stringifying the grades object
  const gradesJson = JSON.stringify(grades);

  const totalScore = useMemo(() => {
    if (!submission) return 0;

    let total = 0;
    submission.questions.forEach((q) => {
      if (q.isAutoGraded) {
        total += q.earnedScore ?? 0;
      } else {
        const gradeValue = grades[q.id];
        total += typeof gradeValue === "number" ? gradeValue : (gradeValue === "" ? 0 : parseFloat(gradeValue!) || 0);
      }
    });

    return total;
  }, [submission, gradesJson]);

  const hasAllManualGrades = useMemo(() => {
    if (!submission) return false;

    const manualQuestions = submission.questions.filter((q) => !q.isAutoGraded);

    const result = manualQuestions.every((q) => {
      const grade = grades[q.id];

      if (grade === undefined || grade === null || grade === "") {
        return false;
      }

      const numGrade = typeof grade === "number" ? grade : parseFloat(grade);
      const isValid = !isNaN(numGrade);
      return isValid;
    });

    return result;
  }, [submission, gradesJson]);

  const onSubmit = async (data: GradeFormData) => {
    if (!submission) return;

    const questionGrades: QuestionGradeInput[] = submission.questions
      .filter((q) => !q.isAutoGraded)
      .map((q) => {
        const gradeValue = data.grades[q.id];
        const score = typeof gradeValue === "number"
          ? gradeValue
          : (gradeValue === "" ? 0 : parseFloat(gradeValue!) || 0);
        const feedback = data.feedbacks[q.id] || undefined;
        return {
          questionId: q.id,
          score,
          feedback,
        };
      });

    try {
      await saveGradeMutation.mutateAsync({
        assignmentId,
        employeeId,
        questionGrades,
        overallFeedback: data.overallFeedback || undefined,
      });

      notifications.show("Chấm bài thành công!", {
        severity: "success",
        autoHideDuration: 3000,
      });
      router.push(PATHS.ASSIGNMENTS.STUDENTS(assignmentId));
    } catch (error) {
      console.error("Failed to save grade:", error);
      notifications.show(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi chấm bài",
        {
          severity: "error",
          autoHideDuration: 5000,
        }
      );
    }
  };

  const handleBack = () => {
    router.push(PATHS.ASSIGNMENTS.STUDENTS(assignmentId));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !submission) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error instanceof Error ? error.message : "Không thể tải thông tin bài nộp"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <AssignmentSubmissionHeader
        avatar={submission.avatar}
        fullName={submission.fullName}
        employeeCode={submission.employeeCode}
        email={submission.email}
        submittedAt={submission.submittedAt}
        assignmentName={submission.assignmentName}
        assignmentDescription={submission.assignmentDescription}
        totalScore={totalScore}
        maxScore={submission.maxScore}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {submission.questions.map((question, index) => (
            <GradeQuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              control={question.isAutoGraded ? undefined : control}
            />
          ))}
        </Stack>

        <Card variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Nhận xét chung
          </Typography>
          <Controller
            name="overallFeedback"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                label="Nhận xét chung cho bài làm"
                multiline
                rows={4}
                fullWidth
                placeholder="Nhập nhận xét chung cho toàn bộ bài làm của học viên (không bắt buộc)"
              />
            )}
          />
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!hasAllManualGrades || saveGradeMutation.isPending}
          >
            {saveGradeMutation.isPending ? "Đang chấm..." : "Chấm bài"}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default AssignmentGrading;

