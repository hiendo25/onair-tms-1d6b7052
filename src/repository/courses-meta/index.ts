import { supabase } from "@/services";
import { CreateCourseMetaPayload, GetCourseMetaQueryParams, UpSertCourseMetaPayload } from "./type";
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

const upsertCourseMeta = async <K extends CourseMetaKey>(upsertPayload: UpSertCourseMetaPayload<K>) => {
  try {
    return await supabase
      .from("courses_metadatas")
      .upsert(upsertPayload.payload)
      .select("*")
      .single()
      .overrideTypes<{ key: Exclude<K, undefined> }>();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Meta");
  }
};

const getCourseMetadatas = async <K extends CourseMetaKey>(params: GetCourseMetaQueryParams<K>) => {
  const { course_id, key } = params;
  if (!course_id) throw new Error("Missing course_id");

  let courseMetadataQuery = supabase
    .from("courses_metadatas")
    .select(
      `
        id, 
        value, 
        key, 
        courses!inner(
          id, 
          title
        )
      `,
    )
    .eq("class_rooms.id", course_id);
  if (key) {
    courseMetadataQuery = courseMetadataQuery.eq("key", key);
  }
  return await courseMetadataQuery.overrideTypes<
    Array<{
      key: Exclude<K, undefined>;
      value: CourseMetaValue<K>;
    }>
  >();
};

export { createCourseMeta, upsertCourseMeta };
