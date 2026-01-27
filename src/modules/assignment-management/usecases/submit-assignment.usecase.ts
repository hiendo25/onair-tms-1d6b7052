import type {
  AnswerValidationResult,
  AnswerValue,
  ProcessedAnswer,
  QuestionAnswer,
} from "@/modules/assignment-management/types/assignment-submission.types";
import { getAnswerValidation } from "@/modules/assignment-management/utils/assignment-submission.utils";
import type { AssignmentQuestionDto } from "@/types/dto/assignments";
import type { FileMetadata } from "@/types/dto/assignments";
import { uploadFileToS3 } from "@/utils/s3-upload";

interface SubmitAssignmentParams {
  assignmentId: string;
  employeeId: string;
  attemptId?: string;
  answers: QuestionAnswer[];
  questions: AssignmentQuestionDto[];
  isAutoSubmit: boolean;
  onUploadProgress?: (value: number) => void;
  fetcher?: typeof fetch;
}

interface SubmitAssignmentResult {
  message?: string;
}

const createUploadProgressTracker = (totalFiles: number, onUploadProgress?: (value: number) => void) => {
  let completedFiles = 0;

  const updateProgress = (value: number) => {
    if (!onUploadProgress || totalFiles === 0) {
      return;
    }

    onUploadProgress(value);
  };

  return {
    onFileProgress: (percent: number) => {
      if (!onUploadProgress || totalFiles === 0) {
        return;
      }

      const currentFileProgress = percent / 100;
      const overallProgress = Math.round(((completedFiles + currentFileProgress) / totalFiles) * 100);
      updateProgress(overallProgress);
    },
    onFileComplete: () => {
      completedFiles += 1;
      updateProgress(Math.round((completedFiles / totalFiles) * 100));
    },
  };
};

const uploadFilesWithProgress = async (
  files: File[],
  tracker: ReturnType<typeof createUploadProgressTracker>,
): Promise<FileMetadata[]> => {
  if (files.length === 0) {
    return [];
  }

  return Promise.all(
    files.map(async (file) => {
      const result = await uploadFileToS3(file, {
        onProgress: (percent) => {
          tracker.onFileProgress(percent);
        },
      });

      tracker.onFileComplete();

      return {
        url: result.url,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    }),
  );
};

const buildAnswerValue = async (
  answer: QuestionAnswer,
  validation: AnswerValidationResult,
  tracker: ReturnType<typeof createUploadProgressTracker>,
): Promise<AnswerValue> => {
  if (validation.isEmpty) {
    throw new Error(validation.errorMessage || "Vui lòng trả lời câu hỏi");
  }

  switch (answer.questionType) {
    case "file":
      return uploadFilesWithProgress(answer.files || [], tracker);
    case "text": {
      const textValue = answer.textAnswer?.trim() || "";
      if (!textValue) {
        throw new Error(validation.errorMessage || "Vui lòng trả lời câu hỏi");
      }
      return textValue;
    }
    case "radio": {
      const value = answer.radioAnswer?.trim() || "";
      if (!value) {
        throw new Error(validation.errorMessage || "Vui lòng trả lời câu hỏi");
      }
      return value;
    }
    case "checkbox":
      if (!answer.checkboxAnswers || answer.checkboxAnswers.length === 0) {
        throw new Error(validation.errorMessage || "Vui lòng trả lời câu hỏi");
      }
      return answer.checkboxAnswers;
    case "matching":
      if (!answer.matchingMappings || answer.matchingMappings.length === 0) {
        throw new Error(validation.errorMessage || "Vui lòng trả lời câu hỏi");
      }
      return answer.matchingMappings;
    case "order":
      if (!answer.orderedItems || answer.orderedItems.length === 0) {
        throw new Error(validation.errorMessage || "Vui lòng trả lời câu hỏi");
      }
      return answer.orderedItems;
    case "true_false":
      if (answer.trueFalseAnswer === undefined) {
        throw new Error(validation.errorMessage || "Vui lòng trả lời câu hỏi");
      }
      return answer.trueFalseAnswer;
    default:
      throw new Error(`Loại câu hỏi không hợp lệ: ${answer.questionType}`);
  }
};

const submitAssignmentUseCase = async ({
  assignmentId,
  employeeId,
  attemptId,
  answers,
  questions,
  isAutoSubmit,
  onUploadProgress,
  fetcher = fetch,
}: SubmitAssignmentParams): Promise<SubmitAssignmentResult> => {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const hasIncompleteAnswers = !isAutoSubmit
    ? answers.some((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        return true;
      }

      const validation = getAnswerValidation(question, answer);
      return !validation.isComplete;
    })
    : false;

  if (hasIncompleteAnswers) {
    throw new Error("Vui lòng trả lời tất cả các câu hỏi");
  }

  const totalFiles = answers.reduce((total, answer) => {
    const fileCount = answer.files?.length ?? 0;
    const attachmentCount = answer.attachments?.length ?? 0;
    return total + fileCount + attachmentCount;
  }, 0);

  const progressTracker = createUploadProgressTracker(totalFiles, onUploadProgress);

  const processedAnswers: ProcessedAnswer[] = await Promise.all(
    answers.map(async (answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new Error("Không tìm thấy thông tin câu hỏi");
      }

      const validation = getAnswerValidation(question, answer);
      const shouldTreatAsEmpty = isAutoSubmit && validation.isEmpty;

      const attachments = answer.attachments?.length
        ? await uploadFilesWithProgress(answer.attachments, progressTracker)
        : undefined;

      if (shouldTreatAsEmpty) {
        return {
          questionId: answer.questionId,
          answer: null,
          attachments,
        };
      }

      const answerValue = await buildAnswerValue(answer, validation, progressTracker);

      return {
        questionId: answer.questionId,
        answer: answerValue,
        attachments,
      };
    }),
  );

  const response = await fetcher(`/api/assignments/${assignmentId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      employeeId,
      attemptId,
      answers: processedAnswers,
      autoSubmit: isAutoSubmit,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Có lỗi xảy ra khi nộp bài");
  }

  return {
    message: result.message,
  };
};

export { submitAssignmentUseCase };
export type { SubmitAssignmentParams, SubmitAssignmentResult };
