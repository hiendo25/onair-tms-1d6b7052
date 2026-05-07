"use client";
import React, { createContext, useContext } from "react";

import { SurveyQuestionType } from "@/model/survey";
import { GetSurveyResponsesById } from "@/repository/surveys";
import { SurveyResponseAnswerValueType } from "@/repository/surveys/survey-responses/type";

type SurveyResponseData = NonNullable<GetSurveyResponsesById["data"]>;

type AnswerResponseBase = SurveyResponseData["responses"][number]["answers"][number] & {
  fullName: string;
  avatar?: string;
};

interface StatisticState {
  responses: SurveyResponseData["responses"];
  questions: SurveyResponseData["questions"];
  isAnswerOfType: <T extends SurveyQuestionType>(
    type: T,
  ) => (ans: AnswerResponseBase) => ans is Omit<AnswerResponseBase, "question_type" | "answer_value"> & {
    question_type: T;
    answer_value: SurveyResponseAnswerValueType<T>;
  };
  getAnswersByQuestionId: <T extends SurveyQuestionType>(
    questionId: string,
    type: T,
  ) =>
    | (Omit<AnswerResponseBase, "question_type" | "answer_value"> & {
        question_type: T;
        answer_value: SurveyResponseAnswerValueType<T>;
      })[]
    | undefined;
}

const SurveyStatisticContext = createContext<StatisticState | null>(null);

interface SurveyStatisticProviderProps {
  children: React.ReactNode;
  data: {
    responses: StatisticState["responses"];
    questions: StatisticState["questions"];
  };
}
const SurveyStatisticProvider: React.FC<SurveyStatisticProviderProps> = ({
  children,
  data: { questions, responses },
}) => {
  const isAnswerOfType: StatisticState["isAnswerOfType"] = (type) => {
    return (ans): ans is any => ans.question_type === type;
  };
  /**
   * Group Response Answers by Question ID
   */
  const responseAnswersGroupByQuestionId = React.useMemo((): Map<string, AnswerResponseBase[]> => {
    const flatResponsesAnswers = responses.flatMap((response) => {
      return response.answers.map((ans) => ({
        ...ans,
        fullName: response.employees.profiles?.full_name || "",
        avatar: response.employees.profiles?.avatar ?? undefined,
      }));
    });

    return Map.groupBy(flatResponsesAnswers, (it) => it.question_id);
  }, [responses]);

  /**
   * Helper to get answers by Question ID.
   */
  const getAnswersByQuestionId: StatisticState["getAnswersByQuestionId"] = (questionId, type) => {
    return responseAnswersGroupByQuestionId.get(questionId)?.filter(isAnswerOfType(type));
  };

  return (
    <SurveyStatisticContext.Provider value={{ questions, responses, isAnswerOfType, getAnswersByQuestionId }}>
      {children}
    </SurveyStatisticContext.Provider>
  );
};
export default SurveyStatisticProvider;

const useSurveyStatistic = () => {
  const context = useContext(SurveyStatisticContext);
  if (!context) {
    throw new Error("useSurveyStatistic must use under SurveyStatisticProvider");
  }
  return context;
};
export { useSurveyStatistic };
