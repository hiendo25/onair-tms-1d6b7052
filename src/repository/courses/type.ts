import { Course } from "@/model/course.model";

export type CreateCoursePayload = Pick<
  Course,
  | "title"
  | "status"
  | "thumbnail_url"
  | "start_at"
  | "end_at"
  | "description"
  | "organization_id"
  | "slug"
  | "community_info"
  | "created_by"
>;

export type UpdateCoursePayload = Pick<
  Course,
  "id" | "title" | "status" | "thumbnail_url" | "start_at" | "end_at" | "description" | "community_info" | "slug"
>;
export type CreatePivotCoursesWithCategoriesPayload = {
  course_id: string;
  category_id: string;
};

export type CreatePivotCoursesWithStudentsPayload = {
  course_id: string;
  student_id: string;
};

export type CreatePivotCoursesWithTeachersPayload = {
  course_id: string;
  teacher_id: string;
};

export type CreatePivotCoursesWithResourcesPayload = {
  course_id: string;
  resource_id: string;
};
