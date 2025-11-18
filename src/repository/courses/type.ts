import { Course } from "@/model/course.model";

export type CreateCoursePayload = Pick<
  Course,
  "title" | "status" | "description" | "organization_id" | "slug" | "created_by"
>;

export type UpdateCoursePayload = Pick<Course, "id" | "title" | "status" | "description" | "slug">;

export type UpsertCoursePayload =
  | { action: "create"; payload: CreateCoursePayload }
  | { action: "update"; payload: UpdateCoursePayload };

export type CreatePivotCoursesWithCategoriesPayload = {
  course_id: string;
  category_id: string;
};
