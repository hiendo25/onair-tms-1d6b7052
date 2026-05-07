import * as zod from "zod";

export const roleFormSchema = zod.object({
  title: zod.string(),
  description: zod.string(),
  code: zod.string(),
  resourcesActions: zod.array(zod.object({ resource: zod.string(), actions: zod.array(zod.string()) })),
});

export type RoleFormData = zod.infer<typeof roleFormSchema>;
