import * as zod from "zod";

import { Constants } from "@/types/supabase.types";

const questionTypeValues = Constants.public.Enums.question_type;

const optionSchema = zod.object({
  id: zod.string(),
  label: zod.string().min(1, { message: "Tùy chọn không được bỏ trống." }),
  correct: zod.boolean(),
});

// Schema for matching question type - independent columns with mappings
const matchingColumnItemSchema = zod.object({
  id: zod.string(),
  content: zod.string().min(1, { message: "Nội dung không được bỏ trống." }),
});

const matchingMappingSchema = zod.object({
  columnAId: zod.string(),
  columnBId: zod.string(),
});

const matchingQuestionDataSchema = zod.object({
  columnAItems: zod.array(matchingColumnItemSchema),
  columnBItems: zod.array(matchingColumnItemSchema),
  correctMappings: zod.array(matchingMappingSchema),
});

// Schema for order question type - items with correct sequence
const orderItemSchema = zod.object({
  id: zod.string(),
  content: zod.string().min(1, { message: "Nội dung không được bỏ trống." }),
  correctOrder: zod.number(), // 1-based position in correct sequence
  displayOrder: zod.number(), // 1-based shuffled display position (consistent for all students)
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
    matchingData: matchingQuestionDataSchema.optional(),
    orderItems: zod.array(orderItemSchema).optional(),
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

    // Validation for true_false type
    if (data.type === "true_false") {
      if (!data.options || data.options.length !== 2) {
        ctx.addIssue({
          code: "custom",
          message: "Câu hỏi Đúng/Sai phải có đúng 2 tùy chọn.",
          path: ["options"],
        });
      } else {
        const correctAnswers = data.options.filter((opt) => opt.correct);
        if (correctAnswers.length !== 1) {
          ctx.addIssue({
            code: "custom",
            message: "Vui lòng chọn đúng 1 đáp án đúng.",
            path: ["options"],
          });
        }
      }
    }

    // Validation for matching type
    if (data.type === "matching") {
      if (!data.matchingData) {
        ctx.addIssue({
          code: "custom",
          message: "Câu hỏi ghép đôi phải có dữ liệu.",
          path: ["matchingData"],
        });
      } else {
        const { columnAItems, columnBItems, correctMappings } = data.matchingData;

        // Check minimum items
        if (columnAItems.length === 0 || columnBItems.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: "Câu hỏi ghép đôi phải có ít nhất 1 mục ở mỗi cột.",
            path: ["matchingData"],
          });
        }

        // Check equal length
        if (columnAItems.length !== columnBItems.length) {
          ctx.addIssue({
            code: "custom",
            message: "Hai cột phải có cùng số lượng mục.",
            path: ["matchingData"],
          });
        }

        // Check all items have mappings
        if (correctMappings.length !== columnAItems.length) {
          ctx.addIssue({
            code: "custom",
            message: "Tất cả các mục phải được ghép đôi.",
            path: ["matchingData", "correctMappings"],
          });
        }
      }
    }

    // Validation for order type
    if (data.type === "order") {
      if (!data.orderItems || data.orderItems.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Câu hỏi sắp xếp thứ tự phải có ít nhất 2 mục.",
          path: ["orderItems"],
        });
      } else {
        // Check for duplicate correctOrder values
        const orders = data.orderItems.map(item => item.correctOrder);
        const uniqueOrders = new Set(orders);
        if (orders.length !== uniqueOrders.size) {
          ctx.addIssue({
            code: "custom",
            message: "Thứ tự các mục không được trùng lặp.",
            path: ["orderItems"],
          });
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
type MatchingQuestionData = zod.infer<typeof matchingQuestionDataSchema>;
type MatchingColumnItem = zod.infer<typeof matchingColumnItemSchema>;
type MatchingMapping = zod.infer<typeof matchingMappingSchema>;
type OrderItem = zod.infer<typeof orderItemSchema>;
type EmployeeItem = zod.infer<typeof employeeItemSchema>;

export {
  assignmentSchema,
  type Assignment,
  type Question,
  type QuestionOption,
  type MatchingQuestionData,
  type MatchingColumnItem,
  type MatchingMapping,
  type OrderItem,
  type EmployeeItem
};

