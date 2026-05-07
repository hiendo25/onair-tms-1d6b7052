import * as zod from "zod";

import { SurveyQuestionType } from "@/model/survey";
const baseQuestionSchema = zod.object({
  questionId: zod.string(),
  questionName: zod.string(),
  isRequired: zod.boolean(),
});
const questionWithTextAnswerSchema = baseQuestionSchema.extend({
  type: zod.literal<Extract<SurveyQuestionType, "text">>("text"),
  answer: zod.object({ value: zod.string().max(800, { error: "Tối đa 800 ký tự" }) }),
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
  questions: zod
    .array(
      zod.discriminatedUnion("type", [
        questionWithRatingSchema,
        questionWithRatingAndSortSchema,
        questionWithMultipleSelectSchema,
        questionWithTextAnswerSchema,
        questionWithSingleSelectSchema,
        questionWithYesNoSchema,
      ]),
    )
    .superRefine((questions, ctx) => {
      questions.forEach((question, index) => {
        if (question.isRequired && question.type === "text" && !question.answer.value) {
          ctx.addIssue({
            code: "custom",
            message: "Không bỏ trống.",
            path: [index, "answer", "value"],
          });
        }

        if (question.isRequired && question.type === "checkbox" && !question.answer.length) {
          ctx.addIssue({
            code: "custom",
            message: "Vui lòng lựa chọn câu trả lời.",
            path: [index, "answer"],
          });
        }

        if (question.isRequired && question.type === "radio" && !question.answer) {
          ctx.addIssue({
            code: "custom",
            message: "Vui lòng lựa chọn câu trả lời.",
            path: [index, "answer"],
          });
        }

        if (question.isRequired && question.type === "rating" && (!question.answer || !question.answer.value)) {
          ctx.addIssue({
            code: "custom",
            message: "Vui lòng đánh giá.",
            path: [index, "answer"],
          });
        }
        if (question.isRequired && question.type === "sort_rating" && !question.answer.length) {
          ctx.addIssue({
            code: "custom",
            message: "Vui lòng đánh giá.",
            path: [index, "answer"],
          });
        }
        if (question.isRequired && question.type === "yes_no" && (!question.answer || !question.answer.value)) {
          ctx.addIssue({
            code: "custom",
            message: "Vui trả lời có hoặc không.",
            path: [index, "answer"],
          });
        }
      });
    }),
});

export type SurveySubmissionFormData = zod.infer<typeof surveySubmissionSchema>;
export type QuestionWithRatingFormData = zod.infer<typeof questionWithRatingSchema>;
export type QuestionWithMultipleSelectFormData = zod.infer<typeof questionWithMultipleSelectSchema>;
export type QuestionWithRatingAndSortFormData = zod.infer<typeof questionWithRatingAndSortSchema>;
export type QuestionWithTextAnswerFormData = zod.infer<typeof questionWithTextAnswerSchema>;
export type QuestionWithSingleSelectFormData = zod.infer<typeof questionWithSingleSelectSchema>;
export type QuestionWithYesNoFormData = zod.infer<typeof questionWithYesNoSchema>;
