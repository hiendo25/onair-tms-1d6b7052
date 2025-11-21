import * as zod from "zod";

export const planSchema = zod.object({
  name: zod.string().min(1, { message: "Tên kế hoạch không được bỏ trống." }),
  objective: zod.string().optional(),
  startDate: zod.string().optional(),
  endDate: zod.string().optional(),
  budget: zod.number().optional(),
});

export type PlanFormSchema = zod.infer<typeof planSchema>;

