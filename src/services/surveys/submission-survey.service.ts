import dayjs from "dayjs";

import {
  QuestionWithMultipleSelectFormData,
  QuestionWithRatingAndSortFormData,
  QuestionWithRatingFormData,
  QuestionWithSingleSelectFormData,
  QuestionWithTextAnswerFormData,
  QuestionWithYesNoFormData,
  SurveySubmissionFormData,
} from "@/modules/surveys/components/SurveySubmissionForm/survey-submission.schema";
import { surveyResponseRepository } from "@/repository";
import {
  CreateAnswerResponsePayload,
  CreateSurveyResponsePayload,
  SurveyResponseAnswerValueType,
} from "@/repository/surveys/survey-responses/type";

type TargetType = NonNullable<CreateSurveyResponsePayload["target_type"]>;
export class SubmissionSurveyService {
  private organizationId: string;

  private userId: string;

  constructor(organizationId: string, userId: string) {
    this.organizationId = organizationId;
    this.userId = userId;
  }

  async submitSurvey(variables: { formData: SurveySubmissionFormData; targetId?: string; targetType?: TargetType }) {
    const { formData, targetType = null, targetId = null } = variables;

    const responsePayload: CreateSurveyResponsePayload = {
      employee_id: this.userId,
      survey_id: formData.surveyId,
      target_id: targetId,
      target_type: targetType,
    };
    const { data: surveyData, error: surveyError } = await surveyResponseRepository.createResponse(responsePayload);

    if (surveyError) {
      throw new Error(surveyError.message);
    }
    const questionsPayload = this.mapAnswerPayload(surveyData.id, formData.questions);
    const { data: questionData, error: questionError } = await surveyResponseRepository.bulkCreateAnswerResponse(
      questionsPayload,
    );

    if (questionError) {
      throw new Error(questionError.message);
    }

    return {
      ...questionData,
      questions: questionData,
    };
  }

  private mapAnswerPayload(
    responseId: string,
    questions: SurveySubmissionFormData["questions"],
  ): CreateAnswerResponsePayload[] {
    return questions.map<CreateAnswerResponsePayload>((question, _questionIndex) => {
      let answerValue: CreateAnswerResponsePayload["answer_value"] = null;

      if (question.type === "radio") {
        answerValue = this.getAnswerRadio(question);
      }
      if (question.type === "checkbox") {
        answerValue = this.getAnswerCheckbox(question);
      }
      if (question.type === "rating") {
        answerValue = this.getAnswerRating(question);
      }
      if (question.type === "sort_rating") {
        answerValue = this.getAnswerSortRating(question);
      }
      if (question.type === "text") {
        answerValue = this.getAnswerText(question);
      }
      if (question.type === "yes_no") {
        answerValue = this.getAnswerYesNo(question);
      }

      return {
        question_id: question.questionId,
        question_text: question.questionName,
        question_type: question.type,
        response_id: responseId,
        answer_value: answerValue,
      };
    });
  }

  private getAnswerCheckbox(question: QuestionWithMultipleSelectFormData): SurveyResponseAnswerValueType<"checkbox"> {
    return question.answer.map((ans) => ({
      isOther: ans.isOther,
      optionId: ans.optionId,
      optionText: ans.optionText,
      otherText: ans.otherText,
    }));
  }

  private getAnswerRadio(question: QuestionWithSingleSelectFormData): SurveyResponseAnswerValueType<"radio"> | null {
    if (!question.answer) return null;

    return {
      isOther: question.answer?.isOther,
      optionId: question.answer?.optionId,
      optionText: question.answer.optionText,
      otherText: question.answer.otherText,
    };
  }

  private getAnswerRating(question: QuestionWithRatingFormData): SurveyResponseAnswerValueType<"rating"> | null {
    if (!question.answer) return null;

    return {
      value: question.answer.value || 0,
    };
  }
  private getAnswerSortRating(
    question: QuestionWithRatingAndSortFormData,
  ): SurveyResponseAnswerValueType<"sort_rating"> | null {
    if (!question.answer) return null;

    return question.answer.map((ans) => ({
      optionId: ans.optionId,
      optionText: ans.optionText,
      priority: ans.priority,
    }));
  }
  private getAnswerText(question: QuestionWithTextAnswerFormData): SurveyResponseAnswerValueType<"text"> | null {
    if (!question.answer) return null;

    return {
      value: question.answer.value || "",
    };
  }
  private getAnswerYesNo(question: QuestionWithYesNoFormData): SurveyResponseAnswerValueType<"yes_no"> | null {
    if (!question.answer) return null;

    return {
      value: question.answer.value || "no",
    };
  }
}
