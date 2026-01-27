"use client";

import * as React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Alert, Box, Button, Card, CircularProgress, LinearProgress, Stack, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

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
import { useGetEmployeeQuery } from "@/modules/employees/operations/query";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";
import { useAssignmentAttemptStart } from "../_hooks/useAssignmentAttemptStart";
import { useAssignmentSubmissionForm } from "../_hooks/useAssignmentSubmissionForm";
import { useAssignmentSubmit } from "../_hooks/useAssignmentSubmit";

import AttemptSummaryCard from "./AttemptSummaryCard";
import QuestionCard from "./QuestionCard";
import SubmissionActions from "./SubmissionActions";

const FORBIDDEN_PATH = "/403";
const ASSIGNMENT_DESCRIPTION_TITLE = "Mô tả bài kiểm tra";
const EMPTY_ASSIGNMENT_DESCRIPTION = "Chưa có mô tả bài kiểm tra.";

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

  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);
  const [windowNow, setWindowNow] = React.useState(() => Date.now());
  const autoSubmittedRef = React.useRef(false);
  const isLoading = isLoadingAssignment || isLoadingQuestions || isLoadingEmployee || isLoadingAttemptSummary;
  const shuffleQuestions = Boolean(assignment?.shuffle_questions);
  const shuffleAnswers = Boolean(assignment?.shuffle_answers);
  const isAssigned = assignment?.assignment_employees?.some(
    (assignmentEmployee) => assignmentEmployee.employee_id === currentEmployeeId,
  );
  const shouldRedirectToForbidden =
    !isEmbedded && !isLoadingAssignment && Boolean(assignment) && !isAssigned;
  const attemptLimit = attemptSummary?.attemptLimit ?? assignment?.attempt_limit ?? null;
  const attemptsRemaining =
    attemptSummary?.attemptsRemaining ??
    (attemptLimit === null ? null : Math.max(attemptLimit - (attemptSummary?.attemptsUsed ?? 0), 0));
  const durationMinutes = attemptSummary?.attemptDurationMinutes ?? assignment?.attempt_duration_minutes ?? null;
  const availableFrom = attemptSummary?.availableFrom ?? assignment?.available_from ?? null;
  const availableTo = attemptSummary?.availableTo ?? assignment?.available_to ?? null;
  const isWithinWindow = React.useMemo(() => {
    const now = windowNow;
    if (availableFrom) {
      const startMs = new Date(availableFrom).getTime();
      if (!Number.isNaN(startMs) && now < startMs) {
        return false;
      }
    }
    if (availableTo) {
      const endMs = new Date(availableTo).getTime();
      if (!Number.isNaN(endMs) && now > endMs) {
        return false;
      }
    }
    return true;
  }, [availableFrom, availableTo, windowNow]);
  const isTimeExpired = remainingSeconds !== null && remainingSeconds <= 0;

  const shouldStartAttempt =
    Boolean(assignmentId && employeeId) && !isLoading && isWithinWindow;
  const { attempt: activeAttempt } = useAssignmentAttemptStart({
    assignmentId,
    employeeId,
    enabled: shouldStartAttempt,
    onError: (error) => {
      notifications.show(error.message, { severity: "error" });
    },
  });

  const fallbackAttempt = attemptSummary?.latestAttempt;
  const activeAttemptId =
    activeAttempt?.status === "in_progress"
      ? activeAttempt.id
      : fallbackAttempt?.status === "in_progress"
        ? fallbackAttempt.id
        : undefined;
  const activeAttemptExpiresAt =
    activeAttempt?.status === "in_progress"
      ? activeAttempt.expiresAt
      : fallbackAttempt?.status === "in_progress"
        ? fallbackAttempt.expiresAt
        : null;
  const displayDurationMinutes =
    activeAttempt?.durationMinutesSnapshot ??
    fallbackAttempt?.durationMinutesSnapshot ??
    durationMinutes;
  const hasActiveAttempt =
    activeAttempt?.status === "in_progress" ||
    attemptSummary?.latestAttempt?.status === "in_progress";
  const hasAttemptsLeft =
    attemptLimit === null ? true : hasActiveAttempt ? true : (attemptsRemaining ?? 0) > 0;

  const {
    answers,
    getValues,
    handleSubmit,
    hasAnyAnswers,
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
  } = useAssignmentSubmissionForm({ questions });

  const { isSubmitting, submitAnswers, uploadProgress } = useAssignmentSubmit({
    assignmentId,
    employeeId,
    questions,
    basePath,
    isEmbedded,
    hasAttemptsLeft,
    isWithinWindow,
    isTimeExpired,
    attemptId: activeAttemptId,
    onSubmitted,
  });

  const shuffleSeedBase = React.useMemo(
    () => buildShuffleSeedBase(assignmentId, employeeId),
    [assignmentId, employeeId],
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

  React.useEffect(() => {
    if (!availableFrom && !availableTo) {
      return;
    }

    const updateNow = () => setWindowNow(Date.now());
    updateNow();

    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, [availableFrom, availableTo]);


  React.useEffect(() => {
    if (!shouldRedirectToForbidden) return;
    router.push(FORBIDDEN_PATH);
  }, [router, shouldRedirectToForbidden]);

  React.useEffect(() => {
    if (!activeAttemptExpiresAt || !hasAttemptsLeft || !isWithinWindow) {
      setRemainingSeconds(null);
      return;
    }

    const expiresMs = new Date(activeAttemptExpiresAt).getTime();
    if (Number.isNaN(expiresMs)) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(expiresMs - Date.now(), 0);
      setRemainingSeconds(Math.ceil(remaining / 1000));
    };

    updateRemaining();

    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [activeAttemptExpiresAt, hasAttemptsLeft, isWithinWindow]);

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

    const descriptionContent = assignment?.description?.trim();
    const descriptionSection = (
      <Stack spacing={2}>
        <Stack
          spacing={1}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {ASSIGNMENT_DESCRIPTION_TITLE}
          </Typography>
          {descriptionContent ? (
            <Box
              sx={{
                "& p": { mb: 1 },
                "& ul, & ol": { pl: 3, mb: 1 },
                "& li": { mb: 0.5 },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                {descriptionContent}
              </ReactMarkdown>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {EMPTY_ASSIGNMENT_DESCRIPTION}
            </Typography>
          )}
        </Stack>
        <AttemptSummaryCard
          attemptsRemaining={attemptsRemaining}
          attemptLimit={attemptLimit}
          availableFrom={availableFrom}
          availableTo={availableTo}
          durationMinutes={displayDurationMinutes}
          remainingSeconds={remainingSeconds}
        />
        {!hasAttemptsLeft && <Alert severity="error">Bạn đã hết số lần làm bài.</Alert>}
        {!isWithinWindow && (
          <Alert severity="warning">Bài kiểm tra không nằm trong thời gian được phép làm bài.</Alert>
        )}
        {isTimeExpired && <Alert severity="error">Đã hết thời gian làm bài.</Alert>}
      </Stack>
    );

    const questionsForDisplay = displayQuestions;

    if (!isWithinWindow) {
      return <Stack spacing={3}>{descriptionSection}</Stack>;
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <Box>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Đang tải lên... {uploadProgress}%
                </Typography>
              </Box>
            )}

            {questionsForDisplay.map((question, index) => {
              const answer = answers?.find((a) => a.questionId === question.id);

              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  // File type props
                  files={answer?.files}
                  onFileSelect={(files) => handleFileSelect(question.id, files)}
                  onRemoveFile={(fileIndex) => handleRemoveFile(question.id, fileIndex)}
                  // Text type props
                  textAnswer={answer?.textAnswer}
                  onTextChange={(text) => handleTextChange(question.id, text)}
                  // Radio type props
                  radioAnswer={answer?.radioAnswer}
                  onRadioChange={(optionId) => handleRadioChange(question.id, optionId)}
                  // Checkbox type props
                  checkboxAnswers={answer?.checkboxAnswers}
                  onCheckboxChange={(optionIds) => handleCheckboxChange(question.id, optionIds)}
                  // Matching type props
                  matchingMappings={answer?.matchingMappings}
                  onMatchingChange={(mappings) => handleMatchingChange(question.id, mappings)}
                  // Order type props
                  orderedItems={answer?.orderedItems}
                  onOrderChange={(orderedItems) => handleOrderChange(question.id, orderedItems)}
                  // True/False type props
                  trueFalseAnswer={answer?.trueFalseAnswer}
                  onTrueFalseChange={(answer) => handleTrueFalseChange(question.id, answer)}
                  // Attachment props
                  attachments={answer?.attachments}
                  onAttachmentSelect={(files) => handleAttachmentSelect(question.id, files)}
                  onRemoveAttachment={(fileIndex) => handleRemoveAttachment(question.id, fileIndex)}
                />
              );
            })}

            <SubmissionActions
              onCancel={handleBack}
              isSubmitDisabled={!hasAnyAnswers || isSubmitting || !hasAttemptsLeft || !isWithinWindow || isTimeExpired}
              isSubmitting={isSubmitting}
              hideCancelButton={isEmbedded && !onCancel}
            />
          </Stack>
        </form>
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
