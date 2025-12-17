import { z as zod } from "zod";

// Custom type for thumbnail that can be either a File (before upload) or string URL (after upload)
const thumbnailSchema = zod.union([
  zod.instanceof(File),
  zod.string(),
  zod.null(),
]).optional();

// General information schema for Step 1
export const generalInfoSchema = zod.object({
  name: zod
    .string()
    .min(1, { message: "Tên lộ trình học tập không được bỏ trống." })
    .max(200, { message: "Tên lộ trình học tập tối đa 200 ký tự." }),
  description: zod.string().optional(),
  thumbnail: thumbnailSchema,
});

// Class-room schema for phase selection
export const classRoomSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  code: zod.string().optional(),
  description: zod.string().optional(),
});

// Phase schema for Step 2
export const phaseSchema = zod.object({
  id: zod.string().optional(), // Optional for new phases
  order: zod.number(),
  description: zod.string().optional(),
  class_rooms: zod
    .array(classRoomSchema)
    .min(1, { message: "Mỗi giai đoạn phải có ít nhất một lớp học." }),
});

// Settings schema for Step 3 (placeholder for now)
export const settingsSchema = zod.object({
  // Add settings fields later
});

// Complete learning path form schema
export const learningPathSchema = zod.object({
  info: generalInfoSchema,
  phases: zod
    .array(phaseSchema)
    .min(1, { message: "Lộ trình học tập phải có ít nhất một giai đoạn." })
    .default([]),
  settings: settingsSchema.optional(),
});

// Type exports
export type ClassRoom = zod.infer<typeof classRoomSchema>;
export type GeneralInfo = zod.infer<typeof generalInfoSchema>;
export type Phase = zod.infer<typeof phaseSchema>;
export type Settings = zod.infer<typeof settingsSchema>;
export type LearningPathFormSchema = zod.infer<typeof learningPathSchema>;
export type LearningPathFormValues = zod.input<typeof learningPathSchema>;

