import * as zod from "zod";

const upsertBranchSchema = zod.object({
  id: zod.string().optional(),
  name: zod.string().min(1, { error: "Tên chi nhánh không bỏ trống" }).max(100, "Tên nhánh tối đa 100 ký tự"),
  address: zod.string(),
  code: zod.string().optional(),
  parentId: zod.string().optional(),
  managedById: zod.string().optional(),
  status: zod.enum(["active", "inactive", "deleted"]).nullable(),
});

type UpsertBranchFormData = zod.infer<typeof upsertBranchSchema>;

export { upsertBranchSchema, type UpsertBranchFormData };
