import { supabase } from "@/services";
import {
  CreateLessonPayload,
  UpdateLessonPayload,
  CreatePivotLessonsWithResourcesPayload,
  UpsertLessonPayload,
} from "./type";

const createLessons = async (payload: CreateLessonPayload[]) => {
  try {
    return await supabase.from("lessons").insert(payload).select("*");
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const bulkDeleteLessons = async (lessonIds: string[]) => {
  try {
    return await supabase.from("lessons").delete().in("id", lessonIds);
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const bulkUpsertLesson = async (upsertPayload: UpsertLessonPayload[]) => {
  try {
    return await supabase
      .from("lessons")
      .upsert(upsertPayload.map((usPl) => usPl.payload))
      .select("*");
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const upsertLesson = async (upsertPayload: UpsertLessonPayload) => {
  try {
    return await supabase.from("lessons").upsert(upsertPayload.payload).select("*").single();
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

const bulkCreatePivotLessonsWithResources = async (payload: CreatePivotLessonsWithResourcesPayload[]) => {
  try {
    return await supabase.from("lessons_resources").insert(payload).select("*");
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const bulkDeletePivotLessonsWithResources = async (ids: number[]) => {
  try {
    return await supabase.from("lessons_resources").delete().in("id", ids);
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

export {
  createLessons,
  updateSection,
  bulkCreatePivotLessonsWithResources,
  bulkDeletePivotLessonsWithResources,
  bulkDeleteLessons,
  upsertLesson,
  bulkUpsertLesson,
};
