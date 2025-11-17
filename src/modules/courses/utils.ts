import { ClassRoomMetaKey, ClassRoomMetaValue } from "@/constants/class-room-meta.constant";

export function getCourseMetaValue<
  K extends ClassRoomMetaKey,
  T extends { key: ClassRoomMetaKey; value: ClassRoomMetaValue },
>(items: T[] | null | undefined, key: K): ClassRoomMetaValue<K> | undefined {
  const record = items?.find((item): item is Extract<T, { key: K }> => item.key === key);
  return record?.value as ClassRoomMetaValue<K> | undefined;
}
