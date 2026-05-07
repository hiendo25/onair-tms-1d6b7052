import { Lesson } from "@/model/lesson.model";
export type LessonInsert = Pick<
  Lesson,
  "title" | "content" | "lesson_type" | "priority" | "section_id" | "main_resource" | "status" | "assignment_id"
>;

export type LessonUpdate = Pick<
  Lesson,
  "title" | "content" | "lesson_type" | "priority" | "main_resource" | "status" | "id" | "assignment_id"
>;

export type LessonUpsert =
  | {
      action: "create";
      payload: LessonInsert;
    }
  | {
      action: "update";
      payload: LessonUpdate;
    };

export type LessonResourceInsert = {
  lesson_id: string;
  resource_id: string;
};
