import { createSVClient } from "@/services";
import { createClient } from "@/services";

import { LessonInsert, LessonResourceInsert, LessonUpdate, LessonUpsert } from "./type";

export async function createLesson(lessonInsert: LessonInsert) {
  const supabase = createClient();
  const { data, error } = await supabase.from("lessons").insert(lessonInsert).select("*");

  if (error) {
    throw new Error(`Create Lessons failed.`);
  }
  return data;
}

export async function bulkCreateLessons(payload: LessonInsert[]) {
  const supabase = createClient();
  const { data, error } = await supabase.from("lessons").insert(payload).select("*");

  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}

export async function bulkDeleteLessons(lessonIds: string[]) {
  const supabase = createClient();
  const { data, error } = await supabase.from("lessons").delete().in("id", lessonIds);
  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }
};

export const bulkDeleteLessonProgressByLessonIds = async (lessonIds: string[]) => {
  const supabase = createClient();
  if (!lessonIds.length) {
    return;
  }

  try {
    const { error } = await supabase.from("lesson_progress").delete().in("lesson_id", lessonIds);

    if (error) {
      throw new Error(`Delete lesson progress failed: ${error.message}`);
    }
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

export const bulkUpsertLesson = async (upsertPayload: LessonUpsert[]) => {
  const supabase = createClient();
  try {
    return await supabase
      .from("lessons")
      .upsert(upsertPayload.map((usPl) => usPl.payload))
      .select("*");
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
}

export async function upsertLesson(upsertPayload: LessonUpsert) {
  const supabase = createClient();

  const { data, error } = await supabase.from("lessons").upsert(upsertPayload.payload).select("*").single();
  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}

export async function updateSection(payload: LessonUpdate) {
  const supabase = createClient();
  const { id: sectionId, ...restPayload } = payload;
  const { data, error } = await supabase
    .from("lessons")
    .update(restPayload)
    .match({ id: sectionId })
    .select("*")
    .single();
  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}

export async function bulkCreateLessonsWithResources(payload: LessonResourceInsert[]) {
  const supabase = createClient();
  const { data, error } = await supabase.from("lessons_resources").insert(payload).select("*");
  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}

export async function bulkDeleteLessonWithResource(recordIds: number[]) {
  const supabase = createClient();
  const { data, error } = await supabase.from("lessons_resources").delete().in("id", recordIds);
  if (error) {
    console.error(error);
    throw new Error(error.details || error.message);
  }
  return data;
}

/**
 * Get the course that contains a specific lesson
 */
export async function getCourseByLessonId(lessonId: string) {
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
}

/**
 * Get all lessons in a specific course
 */
export async function getLessonsByCourseId(courseId: string) {
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