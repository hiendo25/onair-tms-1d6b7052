import { CourseMetaKey, CourseMetaValue } from "@/constants/course-meta.constant";

export function getCourseMetaValue<K extends CourseMetaKey, T extends { key: CourseMetaKey; value: CourseMetaValue }>(
  items: T[] | null | undefined,
  key: K,
): CourseMetaValue<K> | undefined {
  const record = items?.find((item): item is Extract<T, { key: K }> => item.key === key);
  return record?.value as CourseMetaValue<K> | undefined;
}
