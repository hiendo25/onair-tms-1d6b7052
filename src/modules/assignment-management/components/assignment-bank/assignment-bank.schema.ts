import * as zod from "zod";

const numberAsString = (label: string) =>
  zod
    .string()
    .min(1, { message: `${label} không được bỏ trống.` })
    .refine((value) => !Number.isNaN(Number(value)), { message: `${label} phải là số.` })
    .refine((value) => Number(value) > 0, { message: `${label} phải lớn hơn 0.` });

const validatePositiveNumberString = (
  value: string,
  label: string,
  ctx: zod.RefinementCtx,
  path: (string | number)[],
) => {
  if (!value) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: `${label} không được bỏ trống.`,
      path,
    });
    return;
  }

  if (Number.isNaN(Number(value))) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: `${label} phải là số.`,
      path,
    });
    return;
  }

  if (Number(value) <= 0) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: `${label} phải lớn hơn 0.`,
      path,
    });
  }
};

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
    durationMinutes: zod.string(),
    isUnlimitedDuration: zod.boolean(),
    passScore: numberAsString("Điểm đạt tối thiểu"),
    totalScore: zod.number().min(0),
    shuffleQuestions: zod.boolean(),
    shuffleAnswers: zod.boolean(),
    hideCorrectAnswers: zod.boolean(),
    questionIds: zod.array(zod.string()).min(1, { message: "Vui lòng chọn ít nhất 1 câu hỏi." }),
  })
  .superRefine((data, ctx) => {
    if (!data.isUnlimitedDuration) {
      validatePositiveNumberString(data.durationMinutes, "Thời gian làm bài", ctx, ["durationMinutes"]);
    }

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
