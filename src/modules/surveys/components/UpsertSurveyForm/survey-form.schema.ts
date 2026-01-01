import * as zod from "zod";

import { SurveyQuestionType } from "@/model/survey";

const questionTypeValues: SurveyQuestionType[] = ["text", "radio", "checkbox", "rating", "yes_no", "sort_rating"];

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
  .superRefine(({ type, options }, ctx) => {
    const questionMultipleOptionsKeys: SurveyQuestionType[] = ["radio", "checkbox", "sort_rating"];
    if (questionMultipleOptionsKeys.includes(type)) {
      console.log({ options });
      if (options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Câu hỏi loại lựa chọn phải có ít nhất 2 tùy chọn.",
          path: ["options"],
        });
      }

      options.forEach((opt, index) => {
        if (!opt.content.length && !opt.is_other) {
          ctx.addIssue({
            code: "custom",
            message: "Không bỏ trống.",
            path: ["options", index, "content"],
          });
        }
      });
    }
  });

export const upsertSurveyFormSchema = zod.object({
  name: zod
    .string()
    .min(1, { message: "Tên khảo sát không được bỏ trống." })
    .max(200, "Vui lòng nhập tối đa 200 ký tự"),
  slug: zod.string().min(1, { message: "Slug không được bỏ trống." }),
  description: zod.string().min(1, { message: "Mô tả khảo sát không được bỏ trống." }),
  questions: zod.array(surveyQuestionSchema).min(1, { message: "Tạo ít nhất 1 câu hỏi." }),
});

export type UpsertSurveyFormData = zod.infer<typeof upsertSurveyFormSchema>;
export type SurveyQuestionFormData = zod.infer<typeof surveyQuestionSchema>;
