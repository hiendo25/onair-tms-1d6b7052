import * as zod from "zod";
import { QuestionType } from "@/types/survey.types";

const questionTypeValues: QuestionType[] = ["text", "radio", "checkbox", "rating", "select"];

const questionSchema = zod
  .object({
    id: zod.string(),
    label: zod.string().min(1, { message: "Câu hỏi không được bỏ trống." }),
    type: zod.enum(questionTypeValues as [QuestionType, ...QuestionType[]]),
    is_required: zod.boolean(),
    options: zod.array(zod.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "radio" || data.type === "checkbox" || data.type === "select") {
        return data.options && data.options.length >= 2;
      }
      return true;
    },
    {
      message: "Câu hỏi loại lựa chọn phải có ít nhất 2 tùy chọn.",
      path: ["options"],
    }
  );

export const surveySchema = zod.object({
  name: zod.string().min(1, { message: "Tên khảo sát không được bỏ trống." }).max(200, "Vui lòng nhập tối đa 200 ký tự"),
  description: zod.string().min(1, { message: "Mô tả khảo sát không được bỏ trống." }),
  questions: zod.array(questionSchema).min(1, { message: "Tạo ít nhất 1 câu hỏi." }),
});

export type SurveyFormSchema = zod.infer<typeof surveySchema>;
export type QuestionFormSchema = zod.infer<typeof questionSchema>;

