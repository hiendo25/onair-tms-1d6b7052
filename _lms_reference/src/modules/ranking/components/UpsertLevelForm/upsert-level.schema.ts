import * as zod from "zod";

const upsertLevelFormSchema = zod.object({
  id: zod.string().optional(),
  title: zod.string().min(1, { error: "Không bỏ trống" }),
  description: zod.string(),
  scoreRequired: zod.number().min(10, { error: "Nhập số điểm tối thiểu." }),
  icon: zod.string().min(1, "Icon không bỏ trống."),
});

export type UpsertLevelFormData = zod.infer<typeof upsertLevelFormSchema>;
export default upsertLevelFormSchema;
