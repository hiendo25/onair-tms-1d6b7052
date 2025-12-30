import * as zod from "zod";

const baseQuestionSchema = zod.object({
  questionId: zod.string(),
  questionName: zod.string(),
  isRequired: zod.boolean(),
});
const questionWithTextAnswerSchema = baseQuestionSchema.extend({
  type: zod.literal("text"),
  answer: zod.object({ text: zod.string() }),
});

const questionWithSingleSelectSchema = baseQuestionSchema.extend({
  type: zod.literal("radio"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string().optional(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod.object({
    value: zod.string(),
    isOther: zod.boolean(),
    text: zod.string(),
  }),
});

const questionWithMultipleSelectSchema = baseQuestionSchema.extend({
  type: zod.literal("checkbox"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string().optional(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod.array(
    zod.object({
      value: zod.string(),
      text: zod.string(),
      isOther: zod.boolean(),
    }),
  ),
});

const questionWithRatingAndSortSchema = baseQuestionSchema.extend({
  type: zod.literal("rating_sort"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string().optional(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod.array(
    zod.object({
      value: zod.string(),
      text: zod.string(),
      priority: zod.number(),
    }),
  ),
});

const questionWithRatingSchema = baseQuestionSchema.extend({
  type: zod.literal("rating"),
  options: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string().optional(),
      isOther: zod.boolean(),
    }),
  ),
  answer: zod.object({
    value: zod.number().min(1).max(5).optional(),
  }),
});

const questionWithYesNoSchema = baseQuestionSchema.extend({
  type: zod.literal("yes_no"),
  answer: zod.object({
    value: zod.enum(["yes", "no"]).optional(),
  }),
});

export const surveySubmissionSchema = zod.object({
  surveyId: zod.string().optional(),
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
