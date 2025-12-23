import * as zod from "zod";

import { SurveyQuestionType } from "@/model/survey";

const textAnswerSchema = zod.object({
  type: zod.literal(["text"]),
  text: zod.string(),
});

const checboxAnswerSchema = zod.object({
  type: zod.literal(["checkbox"]),
  values: zod.array(
    zod.object({
      value: zod.string(),
      text: zod.string(),
      isOther: zod.boolean(),
    }),
  ),
});

const radioAnswerSchema = zod.object({
  type: zod.literal(["radio"]),
  value: zod.string(),
  isOther: zod.boolean(),
  text: zod.string(),
});

const ratingAnswerSchema = zod.object({
  type: zod.literal(["rating"]),
  value: zod.number().min(1).max(5),
});

const ratingSortAnswerSchema = zod.object({
  type: zod.literal(["rating_sort"]),
  values: zod.array(
    zod.object({
      id: zod.string(),
      priority: zod.number(),
    }),
  ),
});

const yesNoSchema = zod.object({
  type: zod.literal(["yes_no"]),
  value: zod.string(),
});

const questionAnswerSchema = zod
  .object({
    id: zod.string(),
    type: zod.enum(["text", "radio", "checkbox", "rating", "rating_sort", "yes_no"]),
    name: zod.string(),
    options: zod.array(
      zod.object({
        id: zod.string(),
        text: zod.string().optional(),
        isOther: zod.boolean(),
      }),
    ),
    isRequred: zod.boolean(),
    answer: zod.union([
      ratingAnswerSchema,
      radioAnswerSchema,
      yesNoSchema,
      textAnswerSchema,
      checboxAnswerSchema,
      ratingSortAnswerSchema,
    ]),
  })
  .refine((q) => q.type === q.answer.type, {
    message: "Question type must match answer type",
    path: ["answer"],
  });

export const surveySubmissionSchema = zod.object({
  surveyId: zod.string().optional(),
  questions: zod.array(questionAnswerSchema),
});

export type SurveySubmissionFormData = zod.infer<typeof surveySubmissionSchema>;
export type QuestionAnswerSchema = zod.infer<typeof questionAnswerSchema>;
