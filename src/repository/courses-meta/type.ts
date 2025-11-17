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
  id: string;
  course_id: string;
  key: K;
  value: CourseMetaValue<K>;
};
export type UpSertClassRoomMetaPayload<T extends CourseMetaKey> =
  | CreateCourseMetaPayload<T>
  | UpdateCourseMetaPayload<T>;
