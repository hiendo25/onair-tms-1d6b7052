import * as zod from "zod";

import { SurveyQuestionType } from "@/model/survey";
const baseQuestionSchema = zod.object({
  questionId: zod.string(),
  questionName: zod.string(),
  isRequired: zod.boolean(),
});
const questionWithTextAnswerSchema = baseQuestionSchema.extend({
  type: zod.literal<Extract<SurveyQuestionType, "text">>("text"),
  answer: zod.object({ value: zod.string() }),
});

const questionWithSingleSelectSchema = baseQuestionSchema.extend({
  type: zod.literal<Extract<SurveyQuestionType, "radio">>("radio"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string().optional(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod
    .object({
      optionId: zod.string(),
      optionText: zod.string(),
      isOther: zod.boolean(),
      otherText: zod.string(),
    })
    .optional(),
});

const questionWithMultipleSelectSchema = baseQuestionSchema.extend({
  type: zod.literal<Extract<SurveyQuestionType, "checkbox">>("checkbox"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string().optional(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod.array(
    zod.object({
      optionId: zod.string(),
      optionText: zod.string(),
      isOther: zod.boolean(),
      otherText: zod.string(),
    }),
  ),
});

const questionWithRatingAndSortSchema = baseQuestionSchema.extend({
  type: zod.literal<Extract<SurveyQuestionType, "sort_rating">>("sort_rating"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod.array(
    zod.object({
      optionId: zod.string(),
      optionText: zod.string(),
      priority: zod.number(),
    }),
  ),
});

const questionWithRatingSchema = baseQuestionSchema.extend({
  type: zod.literal<Extract<SurveyQuestionType, "rating">>("rating"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string().optional(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod
    .object({
      value: zod.number().min(1).max(5).optional(),
    })
    .optional(),
});

const questionWithYesNoSchema = baseQuestionSchema.extend({
  type: zod.literal<Extract<SurveyQuestionType, "yes_no">>("yes_no"),
  answer: zod
    .object({
      value: zod.enum(["yes", "no"]).optional(),
    })
    .optional(),
});

export const surveySubmissionSchema = zod.object({
  surveyId: zod.string(),
  questions: zod.array(
    zod.discriminatedUnion("type", [
      questionWithRatingSchema,
      questionWithRatingAndSortSchema,
      questionWithMultipleSelectSchema,
      questionWithTextAnswerSchema,
      questionWithSingleSelectSchema,
      questionWithYesNoSchema,
    ]),
  ),
});

export type SurveySubmissionFormData = zod.infer<typeof surveySubmissionSchema>;
export type QuestionWithRatingFormData = zod.infer<typeof questionWithRatingSchema>;
export type QuestionWithMultipleSelectFormData = zod.infer<typeof questionWithMultipleSelectSchema>;
export type QuestionWithRatingAndSortFormData = zod.infer<typeof questionWithRatingAndSortSchema>;
export type QuestionWithTextAnswerFormData = zod.infer<typeof questionWithTextAnswerSchema>;
export type QuestionWithSingleSelectFormData = zod.infer<typeof questionWithSingleSelectSchema>;
export type QuestionWithYesNoFormData = zod.infer<typeof questionWithYesNoSchema>;
