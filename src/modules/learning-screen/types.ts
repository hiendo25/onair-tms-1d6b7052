import type { Database, Tables } from "@/types/supabase.types";

export type CourseRow = Tables<"courses">;
export type SectionRow = Tables<"sections">;
export type LessonRow = Tables<"lessons">;
export type LessonResourceRow = Tables<"lessons_resources">;
export type ResourceRow = Tables<"resources">;
export type AssignmentRow = Tables<"assignments">;

export type LessonTypeEnum = Database["public"]["Enums"]["lesson_type"];

export interface LearningLessonAttachment {
  bridgeId: LessonResourceRow["id"];
  resourceId: LessonResourceRow["resource_id"];
  resource: ResourceRow | null;
}

export interface LearningLesson extends LessonRow {
  attachments: LearningLessonAttachment[];
  mainResource: ResourceRow | null;
  assignment: AssignmentRow | null;
}

export interface LearningSection extends SectionRow {
  lessons: LearningLesson[];
}

export interface LearningCourseDetail {
  course: CourseRow | null;
  sections: LearningSection[];
}
