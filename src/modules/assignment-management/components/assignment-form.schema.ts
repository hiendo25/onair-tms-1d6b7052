import * as zod from "zod";
import { Constants } from "@/types/supabase.types";

const questionTypeValues = Constants.public.Enums.question_type;

const optionSchema = zod.object({
  id: zod.string(),
  label: zod.string().min(1, { message: "Tùy chọn không được bỏ trống." }),
  correct: zod.boolean(),
});

const questionSchema = zod
  .object({
    type: zod.enum(questionTypeValues),
    label: zod.string().min(1, { message: "Câu hỏi không được bỏ trống." }),
    score: zod
      .number({ message: "Điểm không được bỏ trống." })
      .positive({ message: "Điểm phải là số dương." })
      .min(0.1, { message: "Điểm phải lớn hơn 0." }),
    options: zod.array(optionSchema).optional(),
    attachments: zod.array(zod.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "checkbox" || data.type === "radio") {
      if (!data.options || data.options.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Câu hỏi trắc nghiệm phải có ít nhất 1 tùy chọn.",
          path: ["options"],
        });
      } else {
        const correctAnswers = data.options.filter((opt) => opt.correct);

        if (data.type === "radio") {
          if (correctAnswers.length === 0) {
            ctx.addIssue({
              code: "custom",
              message: "Vui lòng chọn đúng 1 đáp án đúng.",
              path: ["options"],
            });
          } else if (correctAnswers.length > 1) {
            ctx.addIssue({
              code: "custom",
              message: "Câu hỏi trắc nghiệm (1 câu trả lời đúng) chỉ được có 1 đáp án đúng.",
              path: ["options"],
            });
          }
        } else if (data.type === "checkbox") {
          if (correctAnswers.length === 0) {
            ctx.addIssue({
              code: "custom",
              message: "Vui lòng chọn ít nhất một đáp án đúng.",
              path: ["options"],
            });
          }
        }
      }
    }
  });

const employeeItemSchema = zod.object({
  id: zod.string(),
  fullName: zod.string(),
  email: zod.string(),
  employeeCode: zod.string(),
  avatar: zod.string().nullable(),
  empoyeeType: zod.enum(["teacher", "student"]),
});

const assignmentSchema = zod.object({
  name: zod.string().min(1, { message: "Tên bài kiểm tra không bỏ trống." }).max(200, "Vui lòng nhập tối đa 200 ký tự"),
  description: zod.string().min(1, { message: "Mô tả bài kiểm tra không bỏ trống." }),
  assignmentCategories: zod
    .array(zod.string())
    .max(3, "Chọn tối đa 3 lĩnh vực.")
    .optional(),
  questions: zod.array(questionSchema).min(1, { message: "Tạo ít nhất 1 câu hỏi." }),
  assignedEmployees: zod.array(employeeItemSchema),
});

type Assignment = zod.infer<typeof assignmentSchema>;
type Question = zod.infer<typeof questionSchema>;
type QuestionOption = zod.infer<typeof optionSchema>;
type EmployeeItem = zod.infer<typeof employeeItemSchema>;

export { assignmentSchema, type Assignment, type Question, type QuestionOption, type EmployeeItem };

