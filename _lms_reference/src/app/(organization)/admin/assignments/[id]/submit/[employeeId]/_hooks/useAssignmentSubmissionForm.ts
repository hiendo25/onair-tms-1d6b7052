import * as React from "react";
import { useForm } from "react-hook-form";

import type {
  QuestionAnswer,
  SubmissionFormData,
} from "@/modules/assignment-management/types/assignment-submission.types";
import {
  buildInitialAnswers,
  getAnswerValidation,
} from "@/modules/assignment-management/utils/assignment-submission.utils";
import {
  clearAssignmentSubmissionDraft,
  loadAssignmentSubmissionDraft,
  mergeDraftAnswers,
  saveAssignmentSubmissionDraft,
} from "@/modules/assignment-management/utils/assignment-submission-draft.utils";
import type { AssignmentQuestionDto } from "@/types/dto/assignments";

interface UseAssignmentSubmissionFormParams {
  questions?: AssignmentQuestionDto[];
  draftKey?: string;
}

const SAVE_DEBOUNCE_MS = 800;

const useAssignmentSubmissionForm = ({ questions, draftKey }: UseAssignmentSubmissionFormParams) => {
  const { handleSubmit, watch, setValue, getValues } = useForm<SubmissionFormData>({
    defaultValues: {
      answers: [],
    },
  });

  const answers = watch("answers");
  const saveTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!questions || questions.length === 0) {
      return;
    }

    const initialAnswers = buildInitialAnswers(questions);
    if (!draftKey) {
      setValue("answers", initialAnswers);
      return;
    }

    const draft = loadAssignmentSubmissionDraft(draftKey);
    if (!draft || draft.answers.length === 0) {
      setValue("answers", initialAnswers);
      return;
    }

    setValue("answers", mergeDraftAnswers(initialAnswers, draft.answers));
  }, [questions, draftKey, setValue]);

  React.useEffect(() => {
    if (!draftKey || !answers || answers.length === 0) {
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveAssignmentSubmissionDraft(draftKey, answers);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, draftKey]);

  const updateAnswer = React.useCallback(
    (questionId: string, updater: (current: QuestionAnswer) => QuestionAnswer) => {
      const currentAnswers = getValues("answers") || [];
      const answerIndex = currentAnswers.findIndex((answer) => answer.questionId === questionId);

      if (answerIndex < 0) {
        return;
      }

      const currentAnswer = currentAnswers[answerIndex];
      if (!currentAnswer) {
        return;
      }

      const updatedAnswers = [...currentAnswers];
      updatedAnswers[answerIndex] = updater(currentAnswer);
      setValue("answers", updatedAnswers, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const appendFilesToAnswer = React.useCallback(
    (questionId: string, field: "files" | "attachments", files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const newFiles = Array.from(files);
      updateAnswer(questionId, (currentAnswer) => {
        if (field === "files") {
          return {
            ...currentAnswer,
            files: [...(currentAnswer.files || []), ...newFiles],
          };
        }

        return {
          ...currentAnswer,
          attachments: [...(currentAnswer.attachments || []), ...newFiles],
        };
      });
    },
    [updateAnswer],
  );

  const removeFileFromAnswer = React.useCallback(
    (questionId: string, field: "files" | "attachments", fileIndex: number) => {
      updateAnswer(questionId, (currentAnswer) => {
        const files = field === "files" ? currentAnswer.files : currentAnswer.attachments;
        if (!files || files.length === 0) {
          return currentAnswer;
        }

        const updatedFiles = [...files];
        updatedFiles.splice(fileIndex, 1);

        if (field === "files") {
          return {
            ...currentAnswer,
            files: updatedFiles,
          };
        }

        return {
          ...currentAnswer,
          attachments: updatedFiles,
        };
      });
    },
    [updateAnswer],
  );

  const handleFileSelect = React.useCallback(
    (questionId: string, files: FileList | null) => {
      appendFilesToAnswer(questionId, "files", files);
    },
    [appendFilesToAnswer],
  );

  const handleRemoveFile = React.useCallback(
    (questionId: string, fileIndex: number) => {
      removeFileFromAnswer(questionId, "files", fileIndex);
    },
    [removeFileFromAnswer],
  );

  const handleTextChange = React.useCallback(
    (questionId: string, text: string) => {
      updateAnswer(questionId, (currentAnswer) => ({
        ...currentAnswer,
        textAnswer: text,
      }));
    },
    [updateAnswer],
  );

  const handleRadioChange = React.useCallback(
    (questionId: string, optionId: string) => {
      updateAnswer(questionId, (currentAnswer) => ({
        ...currentAnswer,
        radioAnswer: optionId,
      }));
    },
    [updateAnswer],
  );

  const handleCheckboxChange = React.useCallback(
    (questionId: string, optionIds: string[]) => {
      updateAnswer(questionId, (currentAnswer) => ({
        ...currentAnswer,
        checkboxAnswers: optionIds,
      }));
    },
    [updateAnswer],
  );

  const handleMatchingChange = React.useCallback(
    (questionId: string, mappings: Array<{ columnAId: string; columnBId: string }>) => {
      updateAnswer(questionId, (currentAnswer) => ({
        ...currentAnswer,
        matchingMappings: mappings,
      }));
    },
    [updateAnswer],
  );

  const handleOrderChange = React.useCallback(
    (questionId: string, orderedItems: Array<{ id: string; position: number }>) => {
      updateAnswer(questionId, (currentAnswer) => ({
        ...currentAnswer,
        orderedItems,
      }));
    },
    [updateAnswer],
  );

  const handleTrueFalseChange = React.useCallback(
    (questionId: string, answer: boolean) => {
      updateAnswer(questionId, (currentAnswer) => ({
        ...currentAnswer,
        trueFalseAnswer: answer,
      }));
    },
    [updateAnswer],
  );

  const handleAttachmentSelect = React.useCallback(
    (questionId: string, files: FileList | null) => {
      appendFilesToAnswer(questionId, "attachments", files);
    },
    [appendFilesToAnswer],
  );

  const handleRemoveAttachment = React.useCallback(
    (questionId: string, fileIndex: number) => {
      removeFileFromAnswer(questionId, "attachments", fileIndex);
    },
    [removeFileFromAnswer],
  );

  const clearDraft = React.useCallback(() => {
    if (!draftKey) {
      return;
    }

    clearAssignmentSubmissionDraft(draftKey);
  }, [draftKey]);

  const questionMap = React.useMemo(() => {
    return new Map((questions || []).map((question) => [question.id, question]));
  }, [questions]);

  const hasAnyAnswers = React.useMemo(() => {
    if (!answers || answers.length === 0) {
      return false;
    }

    return answers.some((answer) => {
      const question = questionMap.get(answer.questionId);
      const validation = getAnswerValidation(question, answer);
      return !validation.isEmpty;
    });
  }, [answers, questionMap]);

  return {
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
  };
};

export { useAssignmentSubmissionForm };
