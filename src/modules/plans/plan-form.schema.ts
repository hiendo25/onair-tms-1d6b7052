import * as zod from "zod";
import { Dayjs } from "dayjs";

// Helper schema to accept both Dayjs objects and strings for date fields
const dateFieldSchema = zod
  .union([
    zod.string(),
    zod.custom<Dayjs>((val) => {
      // Check if it's a Dayjs object by checking for the format method
      return val && typeof val === "object" && "format" in val;
    }),
  ])
  .optional();

// Course schema for assigned courses
export const courseSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
});

// Topic schema for training topics within programs
export const topicSchema = zod.object({
  name: zod.string().min(1, { message: "Tên chủ đề không được bỏ trống." }),
  description: zod.string().optional(),
  courses: zod.array(courseSchema).optional(),
});

export const trainingProgramSchema = zod.object({
  name: zod.string().min(1, { message: "Tên chương trình không được bỏ trống." }),
  startDate: dateFieldSchema,
  endDate: dateFieldSchema,
  description: zod.string().optional(),
  topics: zod.array(topicSchema).optional(),
});

export const planSchema = zod.object({
  info: zod.object({
    name: zod.string().min(1, { message: "Tên kế hoạch không được bỏ trống." }),
    objective: zod.string().optional(),
    startDate: dateFieldSchema,
    endDate: dateFieldSchema,
    budget: zod.number().optional(),
  }),
  programs: zod.array(trainingProgramSchema).min(1, { message: "Cần có ít nhất 1 chương trình đào tạo." }),
});

export type Course = zod.infer<typeof courseSchema>;
export type Topic = zod.infer<typeof topicSchema>;
export type TrainingProgram = zod.infer<typeof trainingProgramSchema>;
export type PlanFormSchema = zod.infer<typeof planSchema>;

