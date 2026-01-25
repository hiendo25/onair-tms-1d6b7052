import { createSVClient, supabase } from "@/services";

import {
  CreateLessonPayload,
  CreatePivotLessonsWithResourcesPayload,
  UpdateLessonPayload,
  UpsertLessonPayload,
} from "./type";

const createLessons = async (payload: CreateLessonPayload[]) => {
  try {
    const { data, error } = await supabase.from("lessons").insert(payload).select("*");

    if (error) {
      throw new Error(`Create Lessons failed.`);
    }
    return data;
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
    const { data, error } = await supabase.from("lessons_resources").insert(payload).select("*");

    if (error) {
      console.error(payload);
      throw new Error("Sync Lessons with Resouces Failed");
    }
    return data;
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

/**
 * Get the course that contains a specific lesson
 */
const getCourseByLessonId = async (lessonId: string) => {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("section_id, sections(course_id)")
    .eq("id", lessonId)
    .single();

  if (error) {
    console.error("[Lessons] Error fetching course by lesson:", error);
    throw new Error(`Failed to fetch course by lesson: ${error.message}`);
  }

  return data;
};

/**
 * Get all lessons in a specific course
 */
const getLessonsByCourseId = async (courseId: string) => {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("id, section_id, sections!inner(course_id)")
    .eq("sections.course_id", courseId);

  if (error) {
    console.error("[Lessons] Error fetching lessons by course:", error);
    throw new Error(`Failed to fetch lessons by course: ${error.message}`);
  }

  return data || [];
};

export {
  createLessons,
  updateSection,
  bulkCreatePivotLessonsWithResources,
  bulkDeletePivotLessonsWithResources,
  bulkDeleteLessons,
  upsertLesson,
  bulkUpsertLesson,
  getCourseByLessonId,
  getLessonsByCourseId,
};
