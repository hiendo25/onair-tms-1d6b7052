import { Lesson } from "@/model/lesson.model";
export type CreateLessonPayload = Pick<
  Lesson,
  "title" | "content" | "lesson_type" | "priority" | "section_id" | "main_resource" | "status" | "assignment_id"
>;

export type UpdateLessonPayload = Pick<
  Lesson,
  "title" | "content" | "lesson_type" | "priority" | "main_resource" | "status" | "id" | "assignment_id"
>;
