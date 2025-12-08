import * as zod from "zod";
import { SurveyQuestionType } from "@/model/survey";

const questionTypeValues: SurveyQuestionType[] = ["text", "radio", "checkbox", "rating", "yes_no", "rating_sort"];

const surveyQuestionSchema = zod
  .object({
    id: zod.string().optional(),
    label: zod.string().min(1, { message: "Câu hỏi không được bỏ trống." }),
    type: zod.enum(questionTypeValues),
    is_required: zod.boolean(),
    options: zod.array(
      zod.object({
        id: zod.string().optional(),
        content: zod.string(),
        is_other: zod.boolean(),
      }),
    ),
  })
  .refine(
    (data) => {
      if (data.type === "radio" || data.type === "checkbox") {
        return data.options && data.options.length >= 2;
      }
      return true;
    },
    {
      message: "Câu hỏi loại lựa chọn phải có ít nhất 2 tùy chọn.",
      path: ["options"],
    },
  );

export const upsertSurveyFormSchema = zod.object({
  name: zod
    .string()
    .min(1, { message: "Tên khảo sát không được bỏ trống." })
    .max(200, "Vui lòng nhập tối đa 200 ký tự"),
  description: zod.string().min(1, { message: "Mô tả khảo sát không được bỏ trống." }),
  questions: zod.array(surveyQuestionSchema).min(1, { message: "Tạo ít nhất 1 câu hỏi." }),
});

export type UpsertSurveyFormData = zod.infer<typeof upsertSurveyFormSchema>;
export type SurveyQuestionFormData = zod.infer<typeof surveyQuestionSchema>;
