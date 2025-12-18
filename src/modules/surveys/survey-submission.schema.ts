import * as zod from "zod";

import { QuestionType } from "@/types/survey.types";

const questionAnswerSchema = zod.object({
  questionId: zod.string(),
  questionType: zod.enum(["text", "radio", "checkbox", "rating", "select"] as [QuestionType, ...QuestionType[]]),
  textAnswer: zod.string().optional(),
  radioAnswer: zod.string().optional(),
  checkboxAnswers: zod.array(zod.string()).optional(),
  ratingAnswer: zod.number().min(1).max(5).optional(),
  selectAnswer: zod.string().optional(),
});

export const surveySubmissionSchema = zod.object({
  answers: zod.array(questionAnswerSchema),
});

export type SurveySubmissionSchema = zod.infer<typeof surveySubmissionSchema>;
export type QuestionAnswerSchema = zod.infer<typeof questionAnswerSchema>;

