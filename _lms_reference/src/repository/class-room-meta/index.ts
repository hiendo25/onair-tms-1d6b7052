import { ClassRoomMetaKey, ClassRoomMetaValue } from "@/constants/class-room-meta.constant";
import { supabase } from "@/services";

import { CreateClassRoomMetaPayload, GetClassRoomMetaQueryParams, UpSertClassRoomMetaPayload } from "./type";
export * from "./type";

const createClassRoomMeta = async <K extends ClassRoomMetaKey>(payload: CreateClassRoomMetaPayload<K>) => {
  try {
    return await supabase
      .from("class_room_metadata")
      .insert({ class_room_id: payload.class_room_id, value: payload.value, key: payload.key })
      .select("*")
      .single()
      .overrideTypes<{ key: Exclude<K, undefined> }>();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Meta");
  }
};

const upsertClassRoomMeta = async <K extends ClassRoomMetaKey>(payload: UpSertClassRoomMetaPayload<K>) => {
  try {
    return await supabase
      .from("class_room_metadata")
      .upsert(payload)
      .select("*")
      .single()
      .overrideTypes<{ key: Exclude<K, undefined> }>();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Meta");
  }
};

const getClassRoomMeta = async <K extends ClassRoomMetaKey>(params: GetClassRoomMetaQueryParams<K>) => {
  const { class_room_id, key } = params;
  if (!class_room_id) throw new Error("Missing class_room_id");

  let classRoomMetaQuery = supabase
    .from("class_room_metadata")
    .select(
      `
        id, 
        value, 
        key, 
        class_rooms!inner(
          id, 
          title
        )
      `,
    )
    .eq("class_rooms.id", class_room_id);
  if (key) {
    classRoomMetaQuery = classRoomMetaQuery.eq("key", key);
  }
  return await classRoomMetaQuery.overrideTypes<
    Array<{
      key: Exclude<K, undefined>;
      value: ClassRoomMetaValue<K>;
    }>
  >();
};

export { createClassRoomMeta, upsertClassRoomMeta, getClassRoomMeta };
