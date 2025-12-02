import * as zod from "zod";

// Survey schema for optional survey selection
export const surveySchema = zod.object({
  id: zod.string(),
  title: zod.string(),
});

// Course schema for assigned courses
export const courseSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  labels: zod.array(zod.string()).optional(), // Optional labels/badges for course items
});

// Topic schema for training topics within programs
export const topicSchema = zod.object({
  name: zod.string().min(1, { message: "Tên chủ đề không được bỏ trống." }),
  description: zod.string().optional(),
  courses: zod.array(courseSchema).optional(),
});

export const trainingProgramSchema = zod.object({
  name: zod.string().min(1, { message: "Tên chương trình không được bỏ trống." }),
  startDate: zod.string().optional().nullable(),
  endDate: zod.string().optional().nullable(),
  description: zod.string().optional(),
  topics: zod.array(topicSchema).optional(),
  courses: zod.array(courseSchema).optional(), // Cho phép gán môn học trực tiếp khi không có chủ đề
});

export const planSchema = zod.object({
  info: zod.object({
    name: zod.string().min(1, { message: "Tên kế hoạch không được bỏ trống." }),
    objective: zod.string().optional(),
    startDate:  zod.string().optional().nullable(),
    endDate: zod.string().optional().nullable(),
    budget: zod.number().optional(),
    survey: surveySchema.optional(), // Optional survey selection
  }),
  programs: zod.array(trainingProgramSchema).min(1, { message: "Cần có ít nhất 1 chương trình đào tạo." }),
});

export type Survey = zod.infer<typeof surveySchema>;
export type Course = zod.infer<typeof courseSchema>;
export type Topic = zod.infer<typeof topicSchema>;
export type TrainingProgram = zod.infer<typeof trainingProgramSchema>;
export type PlanFormSchema = zod.infer<typeof planSchema>;
