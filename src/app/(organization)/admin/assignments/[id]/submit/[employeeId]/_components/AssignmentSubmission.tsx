"use client";

import * as React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Alert, Box, Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import {
  useGetAssignmentAttemptSummaryQuery,
  useGetAssignmentQuery,
  useGetAssignmentQuestionsQuery,
} from "@/modules/assignment-management/operations/query";
import type { SubmissionFormData } from "@/modules/assignment-management/types/assignment-submission.types";
import {
  buildDisplayQuestions,
  buildShuffleSeedBase,
} from "@/modules/assignment-management/utils/assignment-submission.utils";
import { buildAssignmentSubmissionDraftKey } from "@/modules/assignment-management/utils/assignment-submission-draft.utils";
import { useGetEmployeeQuery } from "@/modules/employees/operations/query";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";
import { useAssignmentAttemptState } from "../_hooks/useAssignmentAttemptState";
import { useAssignmentSubmissionForm } from "../_hooks/useAssignmentSubmissionForm";
import { useAssignmentSubmit } from "../_hooks/useAssignmentSubmit";

import AssignmentDescriptionSection from "./AssignmentDescriptionSection";
import AssignmentQuestionsForm from "./AssignmentQuestionsForm";

const FORBIDDEN_PATH = "/403";

interface AssignmentSubmissionProps {
  basePath?: string;
  assignmentId?: string;
  employeeId?: string;
  variant?: "page" | "embedded";
  onSubmitted?: (payload: { assignmentId: string; employeeId: string }) => void;
  onCancel?: () => void;
}

export default function AssignmentSubmission({
  basePath = PATHS.ASSIGNMENTS.ROOT,
  assignmentId: assignmentIdProp,
  employeeId: employeeIdProp,
  variant = "page",
  onSubmitted,
  onCancel,
}: AssignmentSubmissionProps) {
  const params = useParams<{ id?: string; employeeId?: string }>();
  const router = useRouter();
  const notifications = useNotifications();

  const assignmentId = assignmentIdProp ?? (params?.id as string | undefined);
  const employeeId = employeeIdProp ?? (params?.employeeId as string | undefined);
  const isEmbedded = variant === "embedded";

  const currentEmployeeId = useUserOrganization((state) => state.currentEmployee.id);

  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignmentQuery(assignmentId || "");
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useGetAssignmentQuestionsQuery(assignmentId || "");
  const { isLoading: isLoadingEmployee } = useGetEmployeeQuery(employeeId || "");
  const { data: attemptSummary, isLoading: isLoadingAttemptSummary } = useGetAssignmentAttemptSummaryQuery(
    assignmentId || "",
    employeeId || "",
  );

  const autoSubmittedRef = React.useRef(false);
  const shuffleQuestions = Boolean(assignment?.shuffle_questions);
  const shuffleAnswers = Boolean(assignment?.shuffle_answers);
  const isAssigned = assignment?.assignment_employees?.some(
    (assignmentEmployee) => assignmentEmployee.employee_id === currentEmployeeId,
  );
  const shouldRedirectToForbidden =
    !isEmbedded && !isLoadingAssignment && Boolean(assignment) && !isAssigned;
  const {
    attemptLimit,
    attemptsRemaining,
    availableFrom,
    availableTo,
    displayDurationMinutes,
    remainingSeconds,
    isWithinWindow,
    isTimeExpired,
    manualStartRequested,
    setManualStartRequested,
    requiresManualStart,
    isStartingAttempt,
    isLoading,
    activeAttemptId,
    hasAttemptsLeft,
    attemptSeedKey,
  } = useAssignmentAttemptState({
    assignmentId,
    employeeId,
    assignment,
    attemptSummary,
    isLoadingAssignment,
    isLoadingQuestions,
    isLoadingEmployee,
    isLoadingAttemptSummary,
    shuffleQuestions,
    shuffleAnswers,
    onAttemptStartError: (error) => {
      notifications.show(error.message, { severity: "error" });
    },
  });

  const shuffleSeedBase = React.useMemo(
    () => buildShuffleSeedBase(assignmentId, employeeId, attemptSeedKey),
    [assignmentId, employeeId, attemptSeedKey],
  );

  const displayQuestions = React.useMemo(
    () =>
      buildDisplayQuestions(questions || [], {
        seedBase: shuffleSeedBase,
        shuffleQuestions,
        shuffleAnswers,
      }),
    [questions, shuffleAnswers, shuffleQuestions, shuffleSeedBase],
  );

  const draftKey = React.useMemo(
    () => buildAssignmentSubmissionDraftKey(assignmentId, employeeId, activeAttemptId),
    [assignmentId, employeeId, activeAttemptId],
  );

  const {
    answers,
    getValues,
    handleSubmit,
    hasAnyAnswers,
    clearDraft,
    handlers: {
      handleAttachmentSelect,
      handleCheckboxChange,
      handleFileSelect,
      handleMatchingChange,
      handleOrderChange,
      handleRadioChange,
      handleRemoveAttachment,
      handleRemoveFile,
      handleTextChange,
      handleTrueFalseChange,
    },
  } = useAssignmentSubmissionForm({ questions: displayQuestions, draftKey });

  const { isSubmitting, submitAnswers, uploadProgress } = useAssignmentSubmit({
    assignmentId,
    employeeId,
    questions: displayQuestions,
    basePath,
    isEmbedded,
    hasAttemptsLeft,
    isWithinWindow,
    isTimeExpired,
    attemptId: activeAttemptId,
    onSubmitted,
    onSuccess: clearDraft,
  });

  React.useEffect(() => {
    if (!shouldRedirectToForbidden) return;
    router.push(FORBIDDEN_PATH);
  }, [router, shouldRedirectToForbidden]);

  const handleBack = React.useCallback(() => {
    if (onCancel) {
      onCancel();
      return;
    }

    if (isEmbedded || !assignmentId) {
      return;
    }

    if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
      router.push(basePath);
    } else {
      router.push(`${basePath}/${assignmentId}/students`);
    }
  }, [onCancel, isEmbedded, router, assignmentId, basePath]);

  const onSubmit = React.useCallback(
    async (data: SubmissionFormData) => {
      await submitAnswers(data);
    },
    [submitAnswers],
  );

  const breadcrumbs = React.useMemo(() => {
    if (isEmbedded) {
      return undefined;
    }

    if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
      return [{ title: "Bài kiểm tra của tôi", path: basePath }, { title: "Nộp bài" }];
    }
    return [
      { title: "Bài kiểm tra", path: basePath },
      { title: assignment?.name || "...", path: `${basePath}/${assignmentId}/students` },
      { title: "Nộp bài" },
    ];
  }, [isEmbedded, basePath, assignment, assignmentId]);

  const showBackButton = !isEmbedded;

  const renderBody = () => {
    if (!assignmentId) {
      return <Alert severity="warning">Không tìm thấy thông tin bài kiểm tra.</Alert>;
    }

    if (!employeeId) {
      return <Alert severity="warning">Không xác định được thông tin người học.</Alert>;
    }

    if (isLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (questionsError) {
      return <Alert severity="error">Có lỗi xảy ra khi tải danh sách câu hỏi</Alert>;
    }

    const descriptionSection = (
      <AssignmentDescriptionSection
        description={assignment?.description}
        attemptsRemaining={attemptsRemaining}
        attemptLimit={attemptLimit}
        availableFrom={availableFrom}
        availableTo={availableTo}
        durationMinutes={displayDurationMinutes}
        remainingSeconds={remainingSeconds}
        hasAttemptsLeft={hasAttemptsLeft}
        isWithinWindow={isWithinWindow}
        isTimeExpired={isTimeExpired}
      />
    );

    const questionsForDisplay = displayQuestions;

    if (!isWithinWindow) {
      return <Stack spacing={3}>{descriptionSection}</Stack>;
    }

    if (requiresManualStart && !manualStartRequested) {
      return (
        <Stack spacing={3}>
          {descriptionSection}
          <Alert severity="info">
            Bạn đã nộp bài. Nhấn &quot;Làm lại&quot; để bắt đầu lần làm bài tiếp theo.
          </Alert>
          <Box>
            <Button
              variant="contained"
              onClick={() => setManualStartRequested(true)}
              disabled={!hasAttemptsLeft || isStartingAttempt}
            >
              {isStartingAttempt ? "Đang bắt đầu..." : "Làm lại"}
            </Button>
          </Box>
        </Stack>
      );
    }

    if (questionsForDisplay.length === 0) {
      return (
        <Stack spacing={3}>
          {descriptionSection}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Bài kiểm tra chưa có câu hỏi nào
            </Typography>
          </Box>
        </Stack>
      );
    }

    return (
      <Stack spacing={3}>
        {descriptionSection}
        <AssignmentQuestionsForm
          questions={questionsForDisplay}
          answers={answers}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          uploadProgress={uploadProgress}
          hasAnyAnswers={hasAnyAnswers}
          isSubmitDisabled={!hasAttemptsLeft || !isWithinWindow || isTimeExpired}
          onCancel={handleBack}
          hideCancelButton={isEmbedded && !onCancel}
          handlers={{
            handleAttachmentSelect,
            handleCheckboxChange,
            handleFileSelect,
            handleMatchingChange,
            handleOrderChange,
            handleRadioChange,
            handleRemoveAttachment,
            handleRemoveFile,
            handleTextChange,
            handleTrueFalseChange,
          }}
        />
      </Stack>
    );
  };

  React.useEffect(() => {
    if (remainingSeconds === null || remainingSeconds > 0) {
      return;
    }

    if (autoSubmittedRef.current || isSubmitting) {
      return;
    }

    if (!questions || questions.length === 0) {
      return;
    }

    if (!hasAttemptsLeft || !isWithinWindow) {
      return;
    }

    autoSubmittedRef.current = true;
    notifications.show("Hết thời gian làm bài. Hệ thống đang tự động nộp bài...", { severity: "info" });

    const data = getValues();
    submitAnswers(data, { autoSubmit: true });
  }, [
    remainingSeconds,
    hasAttemptsLeft,
    isWithinWindow,
    isSubmitting,
    getValues,
    submitAnswers,
    notifications,
    questions,
  ]);

  const content = (
    <Box sx={{ py: isEmbedded ? 0 : 3 }}>
      <Card
        sx={{
          p: isEmbedded ? 2.5 : 3,
          borderRadius: isEmbedded ? 3 : undefined,
          boxShadow: isEmbedded ? "none" : undefined,
          border: isEmbedded ? "1px solid" : undefined,
          borderColor: isEmbedded ? "divider" : undefined,
        }}
      >
        {showBackButton && (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
              Quay lại
            </Button>
          </Stack>
        )}

        {renderBody()}
      </Card>
    </Box>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <PageContainer title={assignment ? `Nộp bài - ${assignment.name}` : "Nộp bài"} breadcrumbs={breadcrumbs}>
      {content}
    </PageContainer>
  );
}
