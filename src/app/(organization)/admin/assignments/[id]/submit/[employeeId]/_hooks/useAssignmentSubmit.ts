import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { GET_ASSIGNMENTS } from "@/modules/assignment-management/operations/key";
import type { SubmissionFormData } from "@/modules/assignment-management/types/assignment-submission.types";
import { submitAssignmentUseCase } from "@/modules/assignment-management/usecases/submit-assignment.usecase";
import type { AssignmentQuestionDto } from "@/types/dto/assignments";

interface UseAssignmentSubmitParams {
  assignmentId?: string;
  employeeId?: string;
  questions?: AssignmentQuestionDto[];
  basePath: string;
  isEmbedded: boolean;
  hasAttemptsLeft: boolean;
  isWithinWindow: boolean;
  isTimeExpired: boolean;
  attemptId?: string | null;
  onSubmitted?: (payload: { assignmentId: string; employeeId: string }) => void;
}

const useAssignmentSubmit = ({
  assignmentId,
  employeeId,
  questions,
  basePath,
  isEmbedded,
  hasAttemptsLeft,
  isWithinWindow,
  isTimeExpired,
  attemptId,
  onSubmitted,
}: UseAssignmentSubmitParams) => {
  const router = useRouter();
  const { confirm } = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const submitAnswers = React.useCallback(
    async (data: SubmissionFormData, options?: { autoSubmit?: boolean }) => {
      if (!assignmentId || !employeeId) {
        notifications.show("Không tìm thấy thông tin bài kiểm tra hoặc người học.", {
          severity: "error",
        });
        return;
      }

      if (!hasAttemptsLeft) {
        notifications.show("Bạn đã hết số lần làm bài.", { severity: "error" });
        return;
      }

      if (!isWithinWindow) {
        notifications.show("Bài kiểm tra không nằm trong thời gian được phép làm bài.", { severity: "error" });
        return;
      }

      const isAutoSubmit = Boolean(options?.autoSubmit);
      if (isTimeExpired && !isAutoSubmit) {
        notifications.show("Đã hết thời gian làm bài.", { severity: "error" });
        return;
      }
      if (!isAutoSubmit) {
        const confirmed = await confirm(
          "Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn không thể chỉnh sửa.",
          {
            title: "Xác nhận nộp bài",
            okText: "Nộp bài",
            cancelText: "Hủy",
          },
        );

        if (!confirmed) {
          return;
        }
      }

      if (!questions || questions.length === 0) {
        notifications.show("Không tìm thấy thông tin câu hỏi.", { severity: "error" });
        return;
      }

      setIsSubmitting(true);
      setUploadProgress(0);

      try {
        const result = await submitAssignmentUseCase({
          assignmentId,
          employeeId,
          attemptId: attemptId ?? undefined,
          answers: data.answers,
          questions,
          isAutoSubmit,
          onUploadProgress: setUploadProgress,
        });

        notifications.show(
          result.message || (isAutoSubmit ? "Hệ thống đã tự động nộp bài." : "Nộp bài thành công!"),
          {
            severity: "success",
          },
        );

        queryClient.invalidateQueries({
          queryKey: [GET_ASSIGNMENTS, assignmentId, "students"],
        });

        onSubmitted?.({ assignmentId, employeeId });

        if (isEmbedded) {
          return;
        }

        if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
          router.push(PATHS.MY_ASSIGNMENTS.RESULT(assignmentId, employeeId));
        } else {
          router.push(`${basePath}/${assignmentId}/students`);
        }
      } catch (error) {
        console.error("Error submitting assignment:", error);

        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.";

        notifications.show(errorMessage, {
          severity: "error",
        });
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    },
    [
      assignmentId,
      employeeId,
      questions,
      basePath,
      isEmbedded,
      hasAttemptsLeft,
      isWithinWindow,
      isTimeExpired,
      attemptId,
      confirm,
      notifications,
      queryClient,
      router,
      onSubmitted,
    ],
  );

  return {
    isSubmitting,
    submitAnswers,
    uploadProgress,
  };
};

export { useAssignmentSubmit };
