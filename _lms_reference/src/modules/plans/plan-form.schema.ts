import dayjs from "dayjs";
import * as zod from "zod";

import { Enums } from "@/types/supabase.types";

export type PlanSurveyTarget = Enums<"plan_survey_target">;
export type PlanSurveyStatus = Enums<"training_plan_survey_status">;
const planSurveyTargets = ["all", "department", "branch"] as [PlanSurveyTarget, ...PlanSurveyTarget[]];
const planSurveyStatuses = ["pending", "collecting", "closed"] as [PlanSurveyStatus, ...PlanSurveyStatus[]];

// Survey schema for optional survey selection
export const surveySchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  planSurveyId: zod.string().optional(),
  startDate: zod.string().optional().nullable(),
  endDate: zod.string().optional().nullable(),
  targetType: zod.enum(planSurveyTargets).default("all"),
  targetUnitIds: zod.array(zod.string()).optional(),
  status: zod.enum(planSurveyStatuses).optional(),
  createdAt: zod.string().optional().nullable(),
  resultSummary: zod.unknown().optional().nullable(),
}).superRefine((values, ctx) => {
  if (!values.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["startDate"],
      message: "Vui lòng chọn ngày bắt đầu khảo sát",
    });
  }

  if (!values.endDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Vui lòng chọn ngày kết thúc khảo sát",
    });
  }

  const requiresUnits = values.targetType === "branch" || values.targetType === "department";
  if (requiresUnits && (!values.targetUnitIds || values.targetUnitIds.length === 0)) {
    ctx.addIssue({
      code: "custom",
      path: ["targetUnitIds"],
      message: "Vui lòng chọn đơn vị áp dụng",
    });
  }
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
}).superRefine((values, ctx) => {
  if (!values.startDate || !values.endDate) return;

  const startDate = dayjs(values.startDate);
  const endDate = dayjs(values.endDate);

  if (startDate.isValid() && endDate.isValid() && !endDate.isAfter(startDate)) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Ngày kết thúc phải lớn hơn ngày bắt đầu.",
    });
  }
});

export const planSchema = zod.object({
  info: zod.object({
    name: zod.string().min(1, { message: "Tên kế hoạch không được bỏ trống." }).max(200, { message: "Tên kế hoạch tối đa 200 ký tự" }),
    objective: zod.string().optional(),
    startDate: zod.string().optional().nullable(),
    endDate: zod.string().optional().nullable(),
    budget: zod
      .number({ message: "Vui lòng nhập giá vé" })
      .min(0)
      .transform((val) => (val === 0 ? null : val))
      .nullable()
      .optional(),
    survey: surveySchema.optional().nullable(),
  }),
  programs: zod.array(trainingProgramSchema).default([]),
}).superRefine((values, ctx) => {
  const hasSurvey = !!values.info.survey;
  const surveyClosed = values.info.survey?.status === "closed";
  const hasPrograms = Array.isArray(values.programs) && values.programs.length > 0;

  if (!hasPrograms && (!hasSurvey || surveyClosed)) {
    ctx.addIssue({
      code: "custom",
      path: ["programs"],
      message: "Cần có ít nhất 1 chương trình đào tạo.",
    });
  }
}).superRefine((values, ctx) => {
  if (!values.info.startDate || !values.info.endDate) return;

  const startDate = dayjs(values.info.startDate);
  const endDate = dayjs(values.info.endDate);

  if (startDate.isValid() && endDate.isValid() && !endDate.isAfter(startDate)) {
    ctx.addIssue({
      code: "custom",
      path: ["info.endDate"],
      message: "Ngày kết thúc phải lớn hơn ngày bắt đầu.",
    });
  }
})

export type Survey = zod.infer<typeof surveySchema>;
export type SurveyFormValues = zod.input<typeof surveySchema>;
export type Course = zod.infer<typeof courseSchema>;
export type Topic = zod.infer<typeof topicSchema>;
export type TrainingProgram = zod.infer<typeof trainingProgramSchema>;
export type PlanFormSchema = zod.infer<typeof planSchema>;
export type PlanFormValues = zod.input<typeof planSchema>;
