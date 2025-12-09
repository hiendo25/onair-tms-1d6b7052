import { EnumSurveyType } from "@/model/survey";
import { UpsertSurveyFormData } from "@/modules/surveys/survey-form.schema";
import { surveysRepository } from "@/repository";
import { CreateSurveyQuestionPayload } from "@/repository/surveys/surveys-questions/type";
import { CreateSurveyQuestionOptionPayload } from "@/repository/surveys/surveys-questions-options/type";
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

    const surveyPayload: CreateSurveyPayload = {
      created_by: this.userId,
      organization_id: this.organizationId,
      description: formData.description,
      title: formData.name,
      survey_type: type,
      slug: formData.slug,
    };
    const { data: surveyData, error: surveyError } = await surveysRepository.createSurvey(surveyPayload);

    if (surveyError) {
      throw new Error(surveyError.message);
    }
    const questionsPayload = formData.questions.map<CreateSurveyQuestionPayload>((question, _questionIndex) => ({
      is_required: question.is_required,
      name: question.label,
      priority: _questionIndex,
      question_type: question.type,
      survey_id: surveyData.id,
    }));
    const { data: questionData, error: questionError } = await surveysRepository.bulkCreateSurveyQuestion(
      questionsPayload,
    );

    if (questionError) {
      throw new Error(questionError.message);
    }

    await Promise.all(
      questionData.map(async (questionData, questionIndex) => {
        const questionOptions = formData.questions[questionIndex]?.["options"] || [];

        const optionsPayload = questionOptions.map<CreateSurveyQuestionOptionPayload>((opt, _optionIndex) => ({
          survey_question_id: questionData.id,
          priority: _optionIndex,
          option_text: opt.content,
          is_other: opt.is_other,
        }));

        const { data: dataOptions, error: errorOptions } = await surveysRepository.bulkCreateSurveyQuestionOption(
          optionsPayload,
        );
        if (errorOptions) {
          throw new Error(errorOptions.message);
        }
      }),
    );
    return surveyData;
  }

  async updateSurvey(surveyId: string, formdata: UpsertSurveyFormData) {
    const { data: surveyDetail, error: surveyError } = await surveysRepository.getSurveyById(surveyId);

    if (!surveyDetail || surveyError) {
      throw new Error(surveyError.message);
    }

    const upsertSurveyPayload = {};

    // const newSurveyData = await surveysRepository.upsertSurvey()

    return;
  }
}
