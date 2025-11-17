import { supabase } from "@/services";
import { CreateSectionPayload, UpdateSectionPayload } from "./type";

const createSection = async (payload: CreateSectionPayload) => {
  try {
    return await supabase.from("sections").insert(payload).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const updateSection = async (payload: UpdateSectionPayload) => {
  try {
    const { id: sectionId, ...restPayload } = payload;
    return await supabase.from("sections").update(payload).match({ id: sectionId }).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

export { createSection, updateSection };
