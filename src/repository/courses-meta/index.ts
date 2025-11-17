import { supabase } from "@/services";
import { CreateCourseMetaPayload } from "./type";
import { CourseMetaValue, CourseMetaKey } from "@/constants/course-meta.constant";
export * from "./type";

const createCourseMeta = async <K extends CourseMetaKey>(payload: CreateCourseMetaPayload<K>) => {
  try {
    return await supabase
      .from("courses_metadatas")
      .insert({ course_id: payload.course_id, value: payload.value, key: payload.key })
      .select("*")
      .single()
      .overrideTypes<{ key: Exclude<K, undefined> }>();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Meta");
  }
};
export { createCourseMeta };
