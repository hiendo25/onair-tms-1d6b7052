"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageContainer from "@/shared/ui/PageContainer";
import { useGetAssignmentQuery, useGetAssignmentQuestionsQuery } from "@/modules/assignment-management/operations/query";
import { useGetEmployeeQuery } from "@/modules/employees/operations/query";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { uploadFileToS3 } from "@/utils/s3-upload";
import { useQueryClient } from "@tanstack/react-query";
import { GET_ASSIGNMENTS } from "@/modules/assignment-management/operations/key";
import { FileMetadata } from "@/types/dto/assignments";
import { PATHS } from "@/constants/path.contstants";
import QuestionCard from "./QuestionCard";
import SubmissionActions from "./SubmissionActions";

interface QuestionAnswer {
  questionId: string;
  questionType: "file" | "text" | "checkbox" | "radio";
  files?: File[];
  textAnswer?: string;
  radioAnswer?: string;
  checkboxAnswers?: string[];
  attachments?: File[];
}

interface SubmissionFormData {
  answers: QuestionAnswer[];
}

interface AssignmentSubmissionProps {
  basePath?: string;
}

export default function AssignmentSubmission({ basePath = PATHS.ASSIGNMENTS.ROOT }: AssignmentSubmissionProps) {
  const params = useParams();
  const router = useRouter();
  const { confirm } = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const assignmentId = params.id as string;
  const employeeId = params.employeeId as string;

  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignmentQuery(assignmentId);
  const { data: questions, isLoading: isLoadingQuestions, error: questionsError } = useGetAssignmentQuestionsQuery(assignmentId);
  const { data: employee, isLoading: isLoadingEmployee } = useGetEmployeeQuery(employeeId);

  const { control, handleSubmit, watch, setValue } = useForm<SubmissionFormData>({
    defaultValues: {
      answers: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const isLoading = isLoadingAssignment || isLoadingQuestions || isLoadingEmployee;
  const answers = watch("answers");

  React.useEffect(() => {
    if (questions && questions.length > 0) {
      const initialAnswers = questions.map((q) => ({
        questionId: q.id,
        questionType: q.type,
        files: q.type === "file" ? [] : undefined,
        textAnswer: q.type === "text" ? "" : undefined,
        radioAnswer: q.type === "radio" ? "" : undefined,
        checkboxAnswers: q.type === "checkbox" ? [] : undefined,
        attachments: q.type !== "file" ? [] : undefined,
      }));
      setValue("answers", initialAnswers);
    }
  }, [questions, setValue]);

  const handleBack = React.useCallback(() => {
    if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
      router.push(basePath);
    } else {
      router.push(`${basePath}/${assignmentId}/students`);
    }
  }, [router, assignmentId, basePath]);

  const handleFileSelect = React.useCallback((questionId: string, files: FileList | null) => {
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
  }, [answers, setValue]);

  const handleRemoveFile = React.useCallback((questionId: string, fileIndex: number) => {
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
  }, [answers, setValue]);

  const handleTextChange = React.useCallback((questionId: string, text: string) => {
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
  }, [answers, setValue]);

  const handleRadioChange = React.useCallback((questionId: string, optionId: string) => {
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
  }, [answers, setValue]);

  const handleCheckboxChange = React.useCallback((questionId: string, optionIds: string[]) => {
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
  }, [answers, setValue]);

  const handleAttachmentSelect = React.useCallback((questionId: string, files: FileList | null) => {
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
  }, [answers, setValue]);

  const handleRemoveAttachment = React.useCallback((questionId: string, fileIndex: number) => {
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
  }, [answers, setValue]);

  const hasAnyAnswers = () => {
    return answers?.some((answer) => {
      switch (answer.questionType) {
        case "file":
          return answer.files && answer.files.length > 0;
        case "text":
          return answer.textAnswer && answer.textAnswer.trim() !== "";
        case "radio":
          return answer.radioAnswer && answer.radioAnswer.trim() !== "";
        case "checkbox":
          return answer.checkboxAnswers && answer.checkboxAnswers.length > 0;
        default:
          return false;
      }
    }) || false;
  };

  const onSubmit = async (data: SubmissionFormData) => {
    const confirmed = await confirm(
      "Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn không thể chỉnh sửa.",
      {
        title: "Xác nhận nộp bài",
        okText: "Nộp bài",
        cancelText: "Hủy",
      }
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
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
          default:
            return true;
        }
      });

      if (unansweredQuestions.length > 0) {
        throw new Error("Vui lòng trả lời tất cả các câu hỏi");
      }

      const fileAnswers = data.answers.filter(a => a.questionType === "file" && a.files);
      const answersWithAttachments = data.answers.filter(a => a.attachments && a.attachments.length > 0);
      const totalFiles = fileAnswers.reduce((sum, answer) => sum + (answer.files?.length || 0), 0) +
        answersWithAttachments.reduce((sum, answer) => sum + (answer.attachments?.length || 0), 0);
      let completedFiles = 0;

      const processedAnswers = await Promise.all(
        data.answers.map(async (answer) => {
          const question = questions?.find(q => q.id === answer.questionId);
          if (!question) {
            throw new Error("Không tìm thấy thông tin câu hỏi");
          }

          let answerData: string | string[] | FileMetadata[];

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
                          ((completedFiles + currentFileProgress) / totalFiles) * 100
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
                })
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
                        ((completedFiles + currentFileProgress) / totalFiles) * 100
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
              })
            );
          }

          return {
            questionId: answer.questionId,
            questionLabel: question.label,
            questionType: answer.questionType,
            options: question.options,
            answer: answerData,
            attachments: attachmentMetadata,
          };
        })
      );

      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          answers: processedAnswers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Có lỗi xảy ra khi nộp bài");
      }

      notifications.show(result.message || "Nộp bài thành công!", {
        severity: "success",
      });

      queryClient.invalidateQueries({
        queryKey: [GET_ASSIGNMENTS, assignmentId, "students"]
      });

      if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
        router.push(PATHS.MY_ASSIGNMENTS.RESULT(assignmentId, employeeId));
      } else {
        router.push(`${basePath}/${assignmentId}/students`);
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.";

      notifications.show(errorMessage, {
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const breadcrumbs = React.useMemo(() => {
    if (basePath === PATHS.MY_ASSIGNMENTS.ROOT) {
      return [
        { title: "Bài kiểm tra", path: basePath },
        { title: "Nộp bài" },
      ];
    }
    return [
      { title: "Bài kiểm tra", path: basePath },
      { title: assignment?.name || "...", path: `${basePath}/${assignmentId}/students` },
      { title: "Nộp bài" },
    ];
  }, [basePath, assignment, assignmentId]);

  return (
    <PageContainer
      title={assignment ? `Nộp bài - ${assignment.name}` : "Nộp bài"}
      breadcrumbs={breadcrumbs}
    >
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Quay lại
            </Button>
          </Stack>

          {isLoading ? (
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
          ) : questionsError ? (
            <Alert severity="error">
              Có lỗi xảy ra khi tải danh sách câu hỏi
            </Alert>
          ) : !questions || questions.length === 0 ? (
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
          ) : (
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

                {questions.map((question, index) => {
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
                      // Attachment props
                      attachments={answer?.attachments}
                      onAttachmentSelect={(files) => handleAttachmentSelect(question.id, files)}
                      onRemoveAttachment={(fileIndex) => handleRemoveAttachment(question.id, fileIndex)}
                    />
                  );
                })}

                <SubmissionActions
                  onCancel={handleBack}
                  onSubmit={() => {}}
                  isSubmitDisabled={!hasAnyAnswers() || isSubmitting}
                  isSubmitting={isSubmitting}
                />
              </Stack>
            </form>
          )}
        </Card>
      </Box>
    </PageContainer>
  );
}

