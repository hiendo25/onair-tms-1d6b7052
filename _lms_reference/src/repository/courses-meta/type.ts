import { CourseMetaKey, CourseMetaValue } from "@/constants/course-meta.constant";

export type GetCourseMetaQueryParams<K> = {
  course_id: string;
  key?: K;
};

export type CreateCourseMetaPayload<K extends CourseMetaKey> = {
  course_id: string;
  key: K;
  value: CourseMetaValue<K>;
};
export type UpdateCourseMetaPayload<K extends CourseMetaKey> = {
  id: number;
  key: K;
  value: CourseMetaValue<K>;
};
export type UpSertCourseMetaPayload<T extends CourseMetaKey> =
  | { action: "create"; payload: CreateCourseMetaPayload<T> }
  | {
      action: "update";
      payload: UpdateCourseMetaPayload<T>;
    };
