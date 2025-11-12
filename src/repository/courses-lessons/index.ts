import { supabase } from "@/services";
import { CreateLessonPayload, UpdateLessonPayload, CreatePivotLessonsWithResourcesPayload } from "./type";

const createLessons = async (payload: CreateLessonPayload[]) => {
  try {
    return await supabase.from("lessons").insert(payload).select("*");
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

const createPivotLessonsWithResources = async (payload: CreatePivotLessonsWithResourcesPayload[]) => {
  try {
    return await supabase.from("lessons_resources").insert(payload).select("*");
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

export { createLessons, updateSection, createPivotLessonsWithResources };
