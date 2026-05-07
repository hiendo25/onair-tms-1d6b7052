import { useCallback, useMemo, useState } from "react";

import type { QuestionBankDto } from "@/types/dto/question-bank";

const mergeUniqueQuestions = (current: QuestionBankDto[], next: QuestionBankDto[]) => {
  const questionMap = new Map<string, QuestionBankDto>();

  current.forEach((question) => questionMap.set(question.id, question));
  next.forEach((question) => {
    if (!questionMap.has(question.id)) {
      questionMap.set(question.id, question);
    }
  });

  return Array.from(questionMap.values());
};

const useAssignmentBankQuestionSelection = (initialQuestions: QuestionBankDto[] = []) => {
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionBankDto[]>(initialQuestions);

  const selectedQuestionIds = useMemo(
    () => new Set(selectedQuestions.map((question) => question.id)),
    [selectedQuestions],
  );

  const toggleQuestion = useCallback((question: QuestionBankDto) => {
    setSelectedQuestions((prev) => {
      const exists = prev.some((item) => item.id === question.id);
      if (exists) {
        return prev.filter((item) => item.id !== question.id);
      }
      return [...prev, question];
    });
  }, []);

  const toggleAll = useCallback((questions: QuestionBankDto[], checked: boolean) => {
    setSelectedQuestions((prev) => {
      if (checked) {
        return mergeUniqueQuestions(prev, questions);
      }

      const removeIds = new Set(questions.map((question) => question.id));
      return prev.filter((item) => !removeIds.has(item.id));
    });
  }, []);

  const removeQuestion = useCallback((questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((question) => question.id !== questionId));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedQuestions([]);
  }, []);

  return {
    selectedQuestions,
    selectedQuestionIds,
    setSelectedQuestions,
    toggleQuestion,
    toggleAll,
    removeQuestion,
    clearAll,
  };
};

export default useAssignmentBankQuestionSelection;
