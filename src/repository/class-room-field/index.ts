import { supabase } from "@/services";

import { CreateClassFieldPayload } from "./type";

const getClassFields = async () => {
  return await supabase.from("categories").select("*", { count: "exact" }).order("created_at", { ascending: false });
};

const createClassField = async (payload: CreateClassFieldPayload) => {
  try {
    if (!payload.name) {
      console.error("Missing name");
      return;
    }
    return await supabase.from("categories").insert(payload).select("*").single();
  } catch (err) {
    console.log(err);
    throw new Error("Create Class Field Failed");
  }
};

export { createClassField, getClassFields };
