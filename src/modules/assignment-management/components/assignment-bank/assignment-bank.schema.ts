import * as zod from "zod";

const numberAsString = (label: string) =>
  zod
    .string()
    .min(1, { message: `${label} không được bỏ trống.` })
    .refine((value) => !Number.isNaN(Number(value)), { message: `${label} phải là số.` })
    .refine((value) => Number(value) > 0, { message: `${label} phải lớn hơn 0.` });

const assignmentBankFormSchema = zod
  .object({
    name: zod
      .string()
      .min(1, { message: "Tên bài kiểm tra không được bỏ trống." })
      .max(100, "Vui lòng nhập tối đa 100 ký tự."),
    description: zod
      .string()
      .min(1, { message: "Mô tả bài kiểm tra không được bỏ trống." })
      .max(500, "Vui lòng nhập tối đa 500 ký tự."),
    durationMinutes: numberAsString("Thời gian làm bài"),
    passScore: numberAsString("Điểm đạt tối thiểu"),
    totalScore: zod.number().min(0),
    shuffleQuestions: zod.boolean(),
    shuffleAnswers: zod.boolean(),
    questionIds: zod.array(zod.string()).min(1, { message: "Vui lòng chọn ít nhất 1 câu hỏi." }),
  })
  .superRefine((data, ctx) => {
    const passScoreNumber = Number(data.passScore);
    if (Number.isNaN(passScoreNumber) || data.totalScore <= 0) {
      return;
    }

    if (passScoreNumber > data.totalScore) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: `Điểm đạt tối thiểu không được vượt quá tổng điểm (${data.totalScore}).`,
        path: ["passScore"],
      });
    }
  });

type AssignmentBankFormValues = zod.infer<typeof assignmentBankFormSchema>;

export { assignmentBankFormSchema, type AssignmentBankFormValues };
