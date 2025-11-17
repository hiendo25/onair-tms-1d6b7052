import { supabase } from "@/services";
import { CreateLessonPayload, UpdateLessonPayload } from "./type";

const createLessons = async (payload: CreateLessonPayload[]) => {
  try {
    return await supabase.from("lessons").insert(payload).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const updateSection = async (payload: UpdateLessonPayload) => {
  try {
    const { id: sectionId, ...restPayload } = payload;
    return await supabase.from("lessons").update(payload).match({ id: sectionId }).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

export { createLessons, updateSection };
