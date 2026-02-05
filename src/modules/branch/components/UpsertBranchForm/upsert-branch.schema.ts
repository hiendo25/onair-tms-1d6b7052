import * as zod from "zod";

const MIN_MAX_DEPARTMENT_CODE_LENGTH = {
  min: 2,
  max: 8,
};
export const codeSchema = zod
  .string()
  .min(1, { error: "Mã chi nhánh không bỏ trống." })
  .min(2, {
    error: `Mã chi nhánh từ ${MIN_MAX_DEPARTMENT_CODE_LENGTH.min} - ${MIN_MAX_DEPARTMENT_CODE_LENGTH.max} ký tự.`,
  })
  .max(MIN_MAX_DEPARTMENT_CODE_LENGTH.max, {
    error: `Mã chi nhánh từ ${MIN_MAX_DEPARTMENT_CODE_LENGTH.min} - ${MIN_MAX_DEPARTMENT_CODE_LENGTH.max} ký tự.`,
  })
  .regex(/^[A-Za-z0-9-]+$/, "Chỉ cho phép tiếng việt không dấu, số và dấu gạch ngang (-), không có khoảng trắng.")
  .transform((value) => value.toUpperCase());

const upsertBranchSchema = zod.object({
  id: zod.string().optional(),
  name: zod.string().min(1, { error: "Tên chi nhánh không bỏ trống" }).max(100, "Tên nhánh tối đa 100 ký tự"),
  address: zod.string(),
  code: codeSchema,
  managedById: zod.string().optional(),
  status: zod.enum(["active", "inactive", "deleted"]).nullable(),
});

type UpsertBranchFormData = zod.infer<typeof upsertBranchSchema>;

export { upsertBranchSchema, type UpsertBranchFormData };
