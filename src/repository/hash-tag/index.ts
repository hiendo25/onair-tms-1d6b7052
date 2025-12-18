import { supabase } from "@/services";

import { CreateClassRoomHashTagPayload } from "./type";

const getHashTags = async () => {
  try {
    return await supabase.from("hash_tags").select("*", { count: "exact" }).order("created_at", { ascending: false });
  } catch (err) {
    console.log(err);
    throw new Error("Get hashtag Failed");
  }
};

const createClassRoomHashTag = async (payload: CreateClassRoomHashTagPayload) => {
  try {
    return await supabase
      .from("hash_tags")
      .insert({
        ...payload,
        type: "class_room",
      })
      .select("*")
      .single();
  } catch (err) {
    console.log(err);
    throw new Error("Create Classroom hashtag Failed");
  }
};

export { getHashTags, createClassRoomHashTag };
