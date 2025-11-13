"use client";

import React, { useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { useGetSubmissionDetailQuery } from "@/modules/assignment-management/operations/query";
import PageContainer from "@/shared/ui/PageContainer";
import { PATHS } from "@/constants/path.contstants";
import ResultQuestionCard from "./ResultQuestionCard";
import AssignmentSubmissionHeader from "../../../_components/AssignmentSubmissionHeader";

interface AssignmentResultProps {
  assignmentId: string;
  employeeId: string;
  basePath?: string;
}

const AssignmentResult: React.FC<AssignmentResultProps> = ({
  assignmentId,
  employeeId,
  basePath = PATHS.ASSIGNMENTS.ROOT,
}) => {
  const router = useRouter();
  const { data: submission, isLoading, error } = useGetSubmissionDetailQuery(assignmentId, employeeId);

  const totalScore = useMemo(() => {
    if (!submission) return 0;

    let total = 0;
    submission.questions.forEach((q) => {
      total += q.earnedScore ?? 0;
    });

    return total;
  }, [submission]);

  const handleBack = () => {
    if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
      router.push(basePath);
    } else {
      router.push(`${basePath}/${assignmentId}/students`);
    }
  };

  const loadingBreadcrumbs = useMemo(() => {
    if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
      return [
        { title: "Bài kiểm tra của tôi", path: basePath },
        { title: "Kết quả" },
      ];
    }
    return [
      { title: "Bài tập", path: basePath },
      { title: "Kết quả" },
    ];
  }, [basePath]);

  const successBreadcrumbs = useMemo(() => {
    if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
      return [
        { title: "Bài kiểm tra của tôi", path: basePath },
        { title: "Kết quả" },
      ];
    }
    return [
      { title: "Bài tập", path: basePath },
      { title: submission?.assignmentName || "...", path: `${basePath}/${assignmentId}` },
      { title: "Danh sách học viên", path: `${basePath}/${assignmentId}/students` },
      { title: "Kết quả" },
    ];
  }, [basePath, submission, assignmentId]);

  if (isLoading) {
    return (
      <PageContainer
        title="Kết quả bài kiểm tra"
        breadcrumbs={loadingBreadcrumbs}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !submission) {
    return (
      <PageContainer
        title="Kết quả bài kiểm tra"
        breadcrumbs={loadingBreadcrumbs}
      >
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
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Kết quả - ${submission.assignmentName}`}
      breadcrumbs={successBreadcrumbs}
    >
      <Box sx={{ py: 3 }}>
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

        {submission.feedback && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "info.50", border: "1px solid", borderColor: "grey.400" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Nhận xét chung của giáo viên
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {submission.feedback}
            </Typography>
          </Card>
        )}

        <Stack spacing={2} sx={{ mb: 3 }}>
          {submission.questions.map((question, index) => (
            <ResultQuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Quay lại
          </Button>
        </Stack>
      </Box>
    </PageContainer>
  );
};

export default AssignmentResult;

