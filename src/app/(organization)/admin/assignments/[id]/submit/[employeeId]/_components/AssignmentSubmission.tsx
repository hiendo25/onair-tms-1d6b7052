"use client";

import * as React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Alert, Box, Button, Card, CircularProgress, LinearProgress, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { GET_ASSIGNMENTS } from "@/modules/assignment-management/operations/key";
import {
  useGetAssignmentAttemptSummaryQuery,
  useGetAssignmentQuery,
  useGetAssignmentQuestionsQuery,
} from "@/modules/assignment-management/operations/query";
import { useGetEmployeeQuery } from "@/modules/employees/operations/query";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";
import { FileMetadata } from "@/types/dto/assignments";
import { uploadFileToS3 } from "@/utils/s3-upload";

import AttemptSummaryCard from "./AttemptSummaryCard";
import QuestionCard from "./QuestionCard";
import SubmissionActions from "./SubmissionActions";

const FORBIDDEN_PATH = "/403";
const ASSIGNMENT_DESCRIPTION_TITLE = "Mô tả bài kiểm tra";
const EMPTY_ASSIGNMENT_DESCRIPTION = "Chưa có mô tả bài kiểm tra.";
const SEED_BASE = 31;
const LCG_MULTIPLIER = 1664525;
const LCG_INCREMENT = 1013904223;
const MAX_UINT32 = 2 ** 32;

const createSeedFromString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * SEED_BASE + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, LCG_MULTIPLIER) + LCG_INCREMENT) >>> 0;
    return state / MAX_UINT32;
  };
};

const shuffleArray = <T,>(items: T[], seed: number) => {
  if (items.length <= 1) {
    return items;
  }

  const result = [...items];
  const random = createRng(seed);

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

interface QuestionAnswer {
  questionId: string;
  questionType: "file" | "text" | "checkbox" | "radio" | "matching" | "order" | "true_false";
  files?: File[];
  textAnswer?: string;
  radioAnswer?: string;
  checkboxAnswers?: string[];
  matchingMappings?: Array<{ columnAId: string; columnBId: string }>;
  orderedItems?: Array<{ id: string; position: number }>;
  trueFalseAnswer?: boolean;
  attachments?: File[];
}

interface SubmissionFormData {
  answers: QuestionAnswer[];
}

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
  const { confirm } = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

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
  const { data: employee, isLoading: isLoadingEmployee } = useGetEmployeeQuery(employeeId || "");
  const { data: attemptSummary, isLoading: isLoadingAttemptSummary } = useGetAssignmentAttemptSummaryQuery(
    assignmentId || "",
    employeeId || "",
  );

  const { control, handleSubmit, watch, setValue, getValues } = useForm<SubmissionFormData>({
    defaultValues: {
      answers: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);
  const [windowNow, setWindowNow] = React.useState(() => Date.now());
  const autoSubmittedRef = React.useRef(false);
  const isLoading = isLoadingAssignment || isLoadingQuestions || isLoadingEmployee || isLoadingAttemptSummary;
  const answers = watch("answers");
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
  const attemptKey = React.useMemo(
    () => (assignmentId && employeeId ? `assignment_attempt_start:${assignmentId}:${employeeId}` : null),
    [assignmentId, employeeId],
  );
  const hasAttemptsLeft = attemptLimit === null ? true : (attemptsRemaining ?? 0) > 0;
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

  const shuffleSeedBase = React.useMemo(() => {
    if (!assignmentId) {
      return "";
    }
    if (!employeeId) {
      return assignmentId;
    }
    return `${assignmentId}:${employeeId}`;
  }, [assignmentId, employeeId]);

  const displayQuestions = React.useMemo(() => {
    if (!questions || questions.length === 0) {
      return [];
    }

    const baseSeed = shuffleSeedBase;
    if (!baseSeed) {
      return questions;
    }

    let nextQuestions = questions;
    if (shuffleQuestions) {
      const seed = createSeedFromString(`${baseSeed}:questions`);
      nextQuestions = shuffleArray(nextQuestions, seed);
    }

    if (!shuffleAnswers) {
      return nextQuestions;
    }

    return nextQuestions.map((question) => {
      if (question.type !== "radio" && question.type !== "checkbox") {
        return question;
      }
      if (!question.options || question.options.length <= 1) {
        return question;
      }

      const seed = createSeedFromString(`${baseSeed}:options:${question.id}`);
      return {
        ...question,
        options: shuffleArray(question.options, seed),
      };
    });
  }, [questions, shuffleAnswers, shuffleQuestions, shuffleSeedBase]);

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
    if (questions && questions.length > 0) {
      const initialAnswers = questions.map((q) => {
        const answer: any = {
          questionId: q.id,
          questionType: q.type,
          files: q.type === "file" ? [] : undefined,
          textAnswer: q.type === "text" ? "" : undefined,
          radioAnswer: q.type === "radio" ? "" : undefined,
          checkboxAnswers: q.type === "checkbox" ? [] : undefined,
          matchingMappings: q.type === "matching" ? [] : undefined,
          trueFalseAnswer: q.type === "true_false" ? undefined : undefined,
          attachments: q.type !== "file" ? [] : undefined,
        };

        // Initialize order questions with the display order from database
        if (q.type === "order" && q.options) {
          const orderItems = (q.options as any).orderItems || [];
          // Sort by displayOrder and create initial orderedItems
          const sortedByDisplayOrder = [...orderItems].sort((a: any, b: any) => a.displayOrder - b.displayOrder);
          answer.orderedItems = sortedByDisplayOrder.map((item: any, index: number) => ({
            id: item.id,
            position: index + 1,
          }));
        } else {
          answer.orderedItems = q.type === "order" ? [] : undefined;
        }

        return answer;
      });
      setValue("answers", initialAnswers);
    }
  }, [questions, setValue]);

  React.useEffect(() => {
    if (!shouldRedirectToForbidden) return;
    router.push(FORBIDDEN_PATH);
  }, [router, shouldRedirectToForbidden]);

  React.useEffect(() => {
    if (!attemptKey || !durationMinutes || !hasAttemptsLeft || !isWithinWindow) {
      setRemainingSeconds(null);
      return;
    }

    const now = Date.now();
    const stored = localStorage.getItem(attemptKey);
    let startMs = stored ? new Date(stored).getTime() : now;

    if (Number.isNaN(startMs)) {
      startMs = now;
    }

    if (!stored) {
      localStorage.setItem(attemptKey, new Date(startMs).toISOString());
    }

    const maxMs = durationMinutes * 60 * 1000;

    const updateRemaining = () => {
      const elapsedMs = Date.now() - startMs;
      const remaining = Math.max(maxMs - elapsedMs, 0);
      setRemainingSeconds(Math.ceil(remaining / 1000));
    };

    updateRemaining();

    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [attemptKey, durationMinutes, hasAttemptsLeft, isWithinWindow]);

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

  const isAnswerEmpty = React.useCallback((questionType: QuestionAnswer["questionType"], answer: QuestionAnswer) => {
    switch (questionType) {
      case "file":
        return !answer.files || answer.files.length === 0;
      case "text":
        return !answer.textAnswer || answer.textAnswer.trim() === "";
      case "radio":
        return !answer.radioAnswer || answer.radioAnswer.trim() === "";
      case "checkbox":
        return !answer.checkboxAnswers || answer.checkboxAnswers.length === 0;
      case "matching":
        return !answer.matchingMappings || answer.matchingMappings.length === 0;
      case "order":
        return !answer.orderedItems || answer.orderedItems.length === 0;
      case "true_false":
        return answer.trueFalseAnswer === undefined;
      default:
        return true;
    }
  }, []);

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

      if (isTimeExpired) {
        notifications.show("Đã hết thời gian làm bài.", { severity: "error" });
        return;
      }

      const isAutoSubmit = Boolean(options?.autoSubmit);
      if (!isAutoSubmit) {
        const confirmed = await confirm(
          "Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn không thể chỉnh sửa.",
          {
            title: "Xác nhận nộp bài",
            okText: "Nộp bài",
            cancelText: "Hủy",
          },
        );

        if (!confirmed) return;
      }

      setIsSubmitting(true);
      setUploadProgress(0);

      try {
        if (!isAutoSubmit) {
          const unansweredQuestions = data.answers.filter((answer) => {
            switch (answer.questionType) {
              case "file":
                return !answer.files || answer.files.length === 0;
              case "text":
                return !answer.textAnswer || answer.textAnswer.trim() === "";
              case "radio":
                return !answer.radioAnswer || answer.radioAnswer.trim() === "";
              case "checkbox":
                return !answer.checkboxAnswers || answer.checkboxAnswers.length === 0;
              case "matching": {
                const matchingQuestion = questions?.find((q) => q.id === answer.questionId);
                const columnAItems = (matchingQuestion?.options as any)?.columnAItems || [];
                return !answer.matchingMappings || answer.matchingMappings.length !== columnAItems.length;
              }
              case "order": {
                const orderQuestion = questions?.find((q) => q.id === answer.questionId);
                const orderItems = (orderQuestion?.options as any)?.orderItems || [];
                return !answer.orderedItems || answer.orderedItems.length !== orderItems.length;
              }
              case "true_false":
                return answer.trueFalseAnswer === undefined;
              default:
                return true;
            }
          });

          if (unansweredQuestions.length > 0) {
            throw new Error("Vui lòng trả lời tất cả các câu hỏi");
          }
        }

        const fileAnswers = data.answers.filter((a) => a.questionType === "file" && a.files);
        const answersWithAttachments = data.answers.filter((a) => a.attachments && a.attachments.length > 0);
        const totalFiles =
          fileAnswers.reduce((sum, answer) => sum + (answer.files?.length || 0), 0) +
          answersWithAttachments.reduce((sum, answer) => sum + (answer.attachments?.length || 0), 0);
        let completedFiles = 0;

        const processedAnswers = await Promise.all(
          data.answers.map(async (answer) => {
            const question = questions?.find((q) => q.id === answer.questionId);
            if (!question) {
              throw new Error("Không tìm thấy thông tin câu hỏi");
            }

            const shouldTreatAsEmpty = isAutoSubmit && isAnswerEmpty(answer.questionType, answer);
            const hasAttachments = Boolean(answer.attachments && answer.attachments.length > 0);

            if (shouldTreatAsEmpty) {
              let attachmentMetadata: FileMetadata[] | undefined = undefined;
              if (hasAttachments) {
                attachmentMetadata = await Promise.all(
                  answer.attachments!.map(async (file) => {
                    const result = await uploadFileToS3(file, {
                      onProgress: (percent) => {
                        if (totalFiles > 0) {
                          const currentFileProgress = percent / 100;
                          const overallProgress = Math.round(
                            ((completedFiles + currentFileProgress) / totalFiles) * 100,
                          );
                          setUploadProgress(overallProgress);
                        }
                      },
                    });

                    completedFiles++;
                    if (totalFiles > 0) {
                      setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
                    }

                    return {
                      url: result.url,
                      originalName: file.name,
                      fileSize: file.size,
                      mimeType: file.type,
                    };
                  }),
                );
              }

              return {
                questionId: answer.questionId,
                answer: null,
                attachments: attachmentMetadata,
              };
            }

            let answerData: string | string[] | FileMetadata[] | Array<{ columnAId: string; columnBId: string }> | Array<{ id: string; position: number }> | boolean;

            switch (answer.questionType) {
              case "file":
                if (!answer.files || answer.files.length === 0) {
                  throw new Error(`Vui lòng tải lên file cho câu hỏi: ${question.label}`);
                }

                const uploadedFiles = await Promise.all(
                  answer.files.map(async (file) => {
                    const result = await uploadFileToS3(file, {
                      onProgress: (percent) => {
                        if (totalFiles > 0) {
                          const currentFileProgress = percent / 100;
                          const overallProgress = Math.round(
                            ((completedFiles + currentFileProgress) / totalFiles) * 100,
                          );
                          setUploadProgress(overallProgress);
                        }
                      },
                    });

                    completedFiles++;
                    if (totalFiles > 0) {
                      setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
                    }

                    return {
                      url: result.url,
                      originalName: file.name,
                      fileSize: file.size,
                      mimeType: file.type,
                    };
                  }),
                );
                answerData = uploadedFiles;
                break;

              case "text":
                if (!answer.textAnswer || answer.textAnswer.trim() === "") {
                  throw new Error(`Vui lòng nhập câu trả lời cho câu hỏi: ${question.label}`);
                }
                answerData = answer.textAnswer.trim();
                break;

              case "radio":
                if (!answer.radioAnswer || answer.radioAnswer.trim() === "") {
                  throw new Error(`Vui lòng chọn đáp án cho câu hỏi: ${question.label}`);
                }
                answerData = answer.radioAnswer;
                break;

              case "checkbox":
                if (!answer.checkboxAnswers || answer.checkboxAnswers.length === 0) {
                  throw new Error(`Vui lòng chọn ít nhất một đáp án cho câu hỏi: ${question.label}`);
                }
                answerData = answer.checkboxAnswers;
                break;

              case "matching":
                if (!answer.matchingMappings || answer.matchingMappings.length === 0) {
                  throw new Error(`Vui lòng hoàn thành ghép đôi cho câu hỏi: ${question.label}`);
                }
                answerData = answer.matchingMappings;
                break;

              case "order":
                if (!answer.orderedItems || answer.orderedItems.length === 0) {
                  throw new Error(`Vui lòng sắp xếp các mục cho câu hỏi: ${question.label}`);
                }
                answerData = answer.orderedItems;
                break;

              case "true_false":
                if (answer.trueFalseAnswer === undefined) {
                  throw new Error(`Vui lòng chọn Đúng hoặc Sai cho câu hỏi: ${question.label}`);
                }
                answerData = answer.trueFalseAnswer;
                break;

              default:
                throw new Error(`Loại câu hỏi không hợp lệ: ${answer.questionType}`);
            }

            let attachmentMetadata: FileMetadata[] | undefined = undefined;
            if (answer.attachments && answer.attachments.length > 0) {
              attachmentMetadata = await Promise.all(
                answer.attachments.map(async (file) => {
                  const result = await uploadFileToS3(file, {
                    onProgress: (percent) => {
                      if (totalFiles > 0) {
                        const currentFileProgress = percent / 100;
                        const overallProgress = Math.round(
                          ((completedFiles + currentFileProgress) / totalFiles) * 100,
                        );
                        setUploadProgress(overallProgress);
                      }
                    },
                  });

                  completedFiles++;
                  if (totalFiles > 0) {
                    setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
                  }

                  return {
                    url: result.url,
                    originalName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                  };
                }),
              );
            }

            return {
              questionId: answer.questionId,
              answer: answerData,
              attachments: attachmentMetadata,
            };
          }),
        );

        const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId,
            answers: processedAnswers,
            autoSubmit: isAutoSubmit,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Có lỗi xảy ra khi nộp bài");
        }

        notifications.show(result.message || (isAutoSubmit ? "Hệ thống đã tự động nộp bài." : "Nộp bài thành công!"), {
          severity: "success",
        });

        if (attemptKey) {
          localStorage.removeItem(attemptKey);
        }

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
      attemptKey,
      basePath,
      confirm,
      hasAttemptsLeft,
      isEmbedded,
      isWithinWindow,
      isTimeExpired,
      notifications,
      onSubmitted,
      queryClient,
      questions,
      router,
      isAnswerEmpty,
    ],
  );

  const handleFileSelect = React.useCallback(
    (questionId: string, files: FileList | null) => {
      if (!files || files.length === 0) return;

      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const newFiles = Array.from(files);
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          files: [...(currentAnswer.files || []), ...newFiles],
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleRemoveFile = React.useCallback(
    (questionId: string, fileIndex: number) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer || !currentAnswer.files) return;

        const updatedAnswers = [...currentAnswers];
        const updatedFiles = [...currentAnswer.files];
        updatedFiles.splice(fileIndex, 1);
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          files: updatedFiles,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleTextChange = React.useCallback(
    (questionId: string, text: string) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          textAnswer: text,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleRadioChange = React.useCallback(
    (questionId: string, optionId: string) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          radioAnswer: optionId,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleCheckboxChange = React.useCallback(
    (questionId: string, optionIds: string[]) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          checkboxAnswers: optionIds,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleMatchingChange = React.useCallback(
    (questionId: string, mappings: Array<{ columnAId: string; columnBId: string }>) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          matchingMappings: mappings,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleAttachmentSelect = React.useCallback(
    (questionId: string, files: FileList | null) => {
      if (!files || files.length === 0) return;

      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const newFiles = Array.from(files);
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          attachments: [...(currentAnswer.attachments || []), ...newFiles],
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleRemoveAttachment = React.useCallback(
    (questionId: string, fileIndex: number) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer || !currentAnswer.attachments) return;

        const updatedAnswers = [...currentAnswers];
        const updatedAttachments = [...currentAnswer.attachments];
        updatedAttachments.splice(fileIndex, 1);
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          attachments: updatedAttachments,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleOrderChange = React.useCallback(
    (questionId: string, orderedItems: Array<{ id: string; position: number }>) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          orderedItems,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const handleTrueFalseChange = React.useCallback(
    (questionId: string, answer: boolean) => {
      const currentAnswers = answers || [];
      const answerIndex = currentAnswers.findIndex((a) => a.questionId === questionId);

      if (answerIndex >= 0) {
        const currentAnswer = currentAnswers[answerIndex];
        if (!currentAnswer) return;

        const updatedAnswers = [...currentAnswers];
        updatedAnswers[answerIndex] = {
          ...currentAnswer,
          trueFalseAnswer: answer,
        };
        setValue("answers", updatedAnswers);
      }
    },
    [answers, setValue],
  );

  const hasAnyAnswers = () => {
    return (
      answers?.some((answer) => {
        switch (answer.questionType) {
          case "file":
            return answer.files && answer.files.length > 0;
          case "text":
            return answer.textAnswer && answer.textAnswer.trim() !== "";
          case "radio":
            return answer.radioAnswer && answer.radioAnswer.trim() !== "";
          case "checkbox":
            return answer.checkboxAnswers && answer.checkboxAnswers.length > 0;
          case "matching":
            return answer.matchingMappings && answer.matchingMappings.length > 0;
          case "order":
            return answer.orderedItems && answer.orderedItems.length > 0;
          case "true_false":
            return answer.trueFalseAnswer !== undefined;
          default:
            return false;
        }
      }) || false
    );
  };

  const onSubmit = async (data: SubmissionFormData) => {
    await submitAnswers(data);
  };

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
          durationMinutes={durationMinutes}
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
              onSubmit={() => { }}
              isSubmitDisabled={!hasAnyAnswers() || isSubmitting || !hasAttemptsLeft || !isWithinWindow || isTimeExpired}
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
