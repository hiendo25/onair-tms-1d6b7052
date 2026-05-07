import { ClassRoomMetaKey, ClassRoomMetaValue } from "@/constants/class-room-meta.constant";

export type GetClassRoomMetaQueryParams<K> = {
  class_room_id: string;
  key?: K;
};

export type CreateClassRoomMetaPayload<K extends ClassRoomMetaKey> = {
  class_room_id: string;
  key: K;
  value: ClassRoomMetaValue<K>;
};
export type UpdateClassRoomMetaPayload<K extends ClassRoomMetaKey> = {
  id: string;
  class_room_id: string;
  key: K;
  value: ClassRoomMetaValue<K>;
};
export type UpSertClassRoomMetaPayload<T extends ClassRoomMetaKey> =
  | CreateClassRoomMetaPayload<T>
  | UpdateClassRoomMetaPayload<T>;
