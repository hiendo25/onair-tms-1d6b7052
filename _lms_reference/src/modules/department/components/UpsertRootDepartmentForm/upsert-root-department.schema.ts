import * as zod from "zod";

const MIN_MAX_DEPARTMENT_CODE_LENGTH = {
  min: 2,
  max: 8,
};
export const departmentCodeSchema = zod
  .string()
  .min(1, { error: "Mã phòng ban không bỏ trống." })
  .min(2, {
    error: `Mã phòng ban từ ${MIN_MAX_DEPARTMENT_CODE_LENGTH.min} - ${MIN_MAX_DEPARTMENT_CODE_LENGTH.max} ký tự.`,
  })
  .max(MIN_MAX_DEPARTMENT_CODE_LENGTH.max, {
    error: `Mã phòng ban từ ${MIN_MAX_DEPARTMENT_CODE_LENGTH.min} - ${MIN_MAX_DEPARTMENT_CODE_LENGTH.max} ký tự.`,
  })
  .regex(/^[A-Za-z0-9-]+$/, "Chỉ cho phép tiếng việt không dấu, số và dấu gạch ngang (-), không có khoảng trắng.")
  .transform((value) => value.toUpperCase());

const upsertRootDepartmentSchema = zod.object({
  id: zod.string().optional(),
  name: zod.string().min(1, { error: "Tên phòng ban không bỏ trống" }).max(100, "Tên phòng ban tối đa 100 ký tự"),
  code: departmentCodeSchema,
  branchId: zod
    .string()
    .optional()
    .refine((value) => Boolean(value), { error: "Không bỏ trống chi nhánh." }),
  managedById: zod.string().optional(),
  status: zod.enum(["active", "inactive", "deleted"]).nullable(),
});

type UpsertRootDepartmentFormData = zod.infer<typeof upsertRootDepartmentSchema>;

export { upsertRootDepartmentSchema, type UpsertRootDepartmentFormData };
