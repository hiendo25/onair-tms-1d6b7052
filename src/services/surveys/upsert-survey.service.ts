import dayjs from "dayjs";

import { EnumSurveyType } from "@/model/survey";
import { UpsertSurveyFormData } from "@/modules/surveys/components/UpsertSurveyForm/survey-form.schema";
import { surveysRepository } from "@/repository";
import { CreateSurveyQuestionPayload, UpsertSurveyQuestionPayload } from "@/repository/surveys/surveys-questions/type";
import {
  CreateSurveyQuestionOptionPayload,
  UpsertSurveyQuestionOptionPayload,
} from "@/repository/surveys/surveys-questions-options/type";
import { CreateSurveyPayload } from "@/repository/surveys/type";
export class UpsertSurvey {
  private organizationId: string;

  private userId: string;

  constructor(organizationId: string, userId: string) {
    this.organizationId = organizationId;
    this.userId = userId;
  }

  async createSurvey(variables: { formData: UpsertSurveyFormData; type: EnumSurveyType }) {
    const { formData, type } = variables;

    const timestamp = new Date().getTime();
    const surveyPayload: CreateSurveyPayload = {
      created_by: this.userId,
      organization_id: this.organizationId,
      description: formData.description,
      title: formData.name,
      survey_type: type,
      slug: `${formData.slug}-${timestamp}`,
    };
    const { data: surveyData, error: surveyError } = await surveysRepository.createSurvey(surveyPayload);

    if (surveyError) {
      throw new Error(surveyError.message);
    }
    const questionsPayload = this.mapCreateQuestionPayload(surveyData.id, formData.questions);
    const { data: questionData, error: questionError } = await surveysRepository.bulkCreateSurveyQuestion(
      questionsPayload,
    );

    if (questionError) {
      throw new Error(questionError.message);
    }

    await Promise.all(
      questionData.map(async (questionData, _qIndex) => {
        const questionOptions = formData.questions[_qIndex]?.["options"] || [];

        const optionsPayload = questionOptions.map<CreateSurveyQuestionOptionPayload>((opt, _optIndex) => ({
          survey_question_id: questionData.id,
          priority: _optIndex,
          option_text: opt.content,
          is_other: opt.is_other,
        }));

        const { data: dataOptions, error: errorOptions } = await surveysRepository.bulkCreateSurveyQuestionOption(
          optionsPayload,
        );
        if (errorOptions) {
          throw new Error(`${errorOptions.message} ${_qIndex}`);
        }
      }),
    );
    return surveyData;
  }

  async updateSurvey(surveyId: string, formdata: UpsertSurveyFormData) {
    const { data: surveyDetail, error: surveyError } = await surveysRepository.getSurveyById(surveyId);

    const { questions } = formdata;
    if (!surveyDetail || surveyError) {
      throw new Error(surveyError.message);
    }

    const { data: newSurveyData, error: newSurveyError } = await surveysRepository.updateSurvey({
      id: surveyDetail.id,
      slug: formdata.slug,
      survey_type: surveyDetail.survey_type,
      title: formdata.name,
      description: formdata.description,
    });

    if (!newSurveyData || newSurveyError) {
      throw new Error(newSurveyError.message);
    }

    await Promise.all(
      questions.map(async (question, questionIndex) => {
        const upsertQuestionPayload = this.mapUpsertQuestionPayload({
          index: questionIndex,
          question: question,
          surveyId,
        });
        const { data: questionData, error: questionError } = await surveysRepository.upsertSurveyQuestion(
          upsertQuestionPayload,
        );

        if (!questionData || questionError) {
          throw new Error(`Question ${questionIndex} failed with: ${questionError.message}`);
        }

        (async (questionData, questionIndex, options) => {
          const questionId = questionData.id;
          await Promise.all(
            options.map(async (option, _optIndex) => {
              const { data: optionsData, error: optionsError } = await surveysRepository.upsertSurveyQuestionOption(
                this.mapUpsertSurveyQuestionOptions(questionId, option, _optIndex),
              );

              if (optionsError || !optionsData) {
                throw new Error(`question index ${_optIndex} fail with ${optionsError.message} `);
              }
            }),
          );
        })(questionData, questionIndex, question.options);
      }),
    );

    return newSurveyData;
  }

  /**
   * Utils
   */
  private mapUpsertQuestionPayload(variables: {
    question: UpsertSurveyFormData["questions"][number];
    surveyId: string;
    index: number;
  }): UpsertSurveyQuestionPayload {
    const { question, surveyId, index } = variables;

    const questionId = question.id;
    return questionId
      ? {
          action: "update",
          payload: {
            id: questionId,
            is_required: question.is_required,
            name: question.label,
            priority: index,
            question_type: question.type,
          },
        }
      : {
          action: "create",
          payload: {
            survey_id: surveyId,
            is_required: question.is_required,
            name: question.label,
            priority: index,
            question_type: question.type,
          },
        };
  }

  private mapCreateQuestionPayload(
    surveyId: string,
    questions: UpsertSurveyFormData["questions"],
  ): CreateSurveyQuestionPayload[] {
    return questions.map<CreateSurveyQuestionPayload>((question, _questionIndex) => ({
      survey_id: surveyId,
      is_required: question.is_required,
      name: question.label,
      priority: _questionIndex,
      question_type: question.type,
    }));
  }

  private mapUpsertSurveyQuestionOptions(
    questionId: string,
    option: UpsertSurveyFormData["questions"][number]["options"][number],
    index: number,
  ): UpsertSurveyQuestionOptionPayload {
    const optionId = option.id;

    return optionId
      ? {
          action: "update",
          payload: {
            id: optionId,
            is_other: option.is_other,
            option_text: option.content,
            priority: index,
            survey_question_id: questionId,
          },
        }
      : {
          action: "create",
          payload: {
            is_other: option.is_other,
            option_text: option.content,
            priority: index,
            survey_question_id: questionId,
          },
        };
  }
}
