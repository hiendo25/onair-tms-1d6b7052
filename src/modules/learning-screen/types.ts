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

interface LearningLessonBase extends LessonRow {
  mainResource: ResourceRow | null;
}

export interface LearningLesson extends LearningLessonBase {
  attachments: LearningLessonAttachment[];
  assignment: AssignmentRow | null;
}

export type LearningLessonSummary = LearningLessonBase;

export interface LearningSectionOutline extends SectionRow {
  lessons: LearningLessonSummary[];
}

export interface LearningCourseOutline {
  course: CourseRow | null;
  sections: LearningSectionOutline[];
}

export interface LessonContentLike {
  lesson_type: LessonTypeEnum | null;
  mainResource: ResourceRow | null;
  content?: string | null;
}
