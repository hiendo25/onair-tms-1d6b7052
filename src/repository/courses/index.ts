import { supabase } from "@/services";
import {
  CreateCoursePayload,
  UpdateCoursePayload,
  UpsertCoursePayload,
  CreatePivotCoursesWithCategoriesPayload,
  CreatePivotCoursesWithTeachersPayload,
  CreatePivotCoursesWithStudentsPayload,
  CreatePivotCoursesWithResourcesPayload,
} from "./type";
import { CourseMetaKey, CourseMetaValue } from "@/constants/course-meta.constant";

const createCourse = async (payload: CreateCoursePayload) => {
  try {
    return await supabase.from("courses").insert(payload).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const updateCourse = async (payload: UpdateCoursePayload) => {
  try {
    const { id: courseId, ...restPayload } = payload;
    return await supabase.from("courses").update(restPayload).match({ id: courseId }).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const createPivotCoursesWithCategories = async (payload: CreatePivotCoursesWithCategoriesPayload[]) => {
  try {
    return await supabase.from("courses_categories").insert(payload).select("*");
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Room");
  }
};

const deletePivotCoursesWithCategories = async (ids: number[]) => {
  try {
    return await supabase.from("courses_categories").delete().in("id", ids).select("*");
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error Delete Pivot Courses With Categories");
  }
};

const createPivotCoursesWithStudents = async (payload: CreatePivotCoursesWithStudentsPayload[]) => {
  try {
    return await supabase.from("courses_students").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

const createPivotCoursesWithTeachers = async (payload: CreatePivotCoursesWithTeachersPayload[]) => {
  try {
    return await supabase.from("courses_teachers").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

const createPivotCoursesWithResources = async (payload: CreatePivotCoursesWithResourcesPayload[]) => {
  try {
    return await supabase.from("courses_resources").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

const deletePivotCoursesWithResources = async (ids: number[]) => {
  try {
    return await supabase.from("courses_resources").delete().in("id", ids).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

const getCourseById = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(
        `
          id, 
          title,
          slug,
          description,
          community_info,
          thumbnail_url,
          start_at,
          end_at,
          status,
          created_by,
          courses_metadatas(id, key, value, course_id),
          courses_categories(
            id,
            categories(
              id, name, slug
            )
          ),
          courses_resources(
            id, 
            resources(
              id,
              path,
              size, 
              kind, 
              mime_type, 
              name
            )
          ),
          courses_students(
            id,
            student:employees(
              id,
              employee_type,
              employee_code,
              profile:profiles(
                id,
                full_name,
                email,
                employee_id,
                avatar
              )
            )
          ),
           courses_teachers(
            id,
            teacher:employees(
              id,
              employee_type,
              employee_code,
              profile:profiles(
                id,
                full_name,
                email,
                employee_id,
                avatar
              )
            )
          ),
          owner:employees(
            id,
            employee_type,
            employee_code,
            profile:profiles(
              id,
              full_name,
              email,
              employee_id,
              avatar
            )
          ),
          organizations(
            id, 
            name
          ),
          sections(
            id,
            title,
            description,
            course_id,
            status,
            priority,
            lessons(
              id,
              title,
              content,
              section_id,
              assignment_id,
              lesson_type,
              priority,
              status,
              main_resource:resources(
                id,
                path,
                size, 
                kind, 
                mime_type, 
                name
              ),
              assignments(
                id,
                name, 
                description
              ),
              lessons_resources(
                id,
                resource:resources(
                  id,
                  path,
                  size, 
                  kind, 
                  mime_type, 
                  name
                  )
                )
            )
          )
        `,
      )
      .eq("id", courseId)
      .order("priority", { ascending: true, referencedTable: "sections" })
      .order("priority", { ascending: true, referencedTable: "sections.lessons" })
      .single()
      .overrideTypes<{
        courses_metadatas: {
          class_room_id: string;
          id: number;
          key: CourseMetaKey;
          value: CourseMetaValue;
        }[];
        community_info: { name: string; url: string };
      }>();
    return { data, error };
  } catch (err: any) {
    throw new Error(err?.message ?? "Fetching ClassRoom Detail failed not found");
  }
};
export type GetCourseByIdResponse = Awaited<ReturnType<typeof getCourseById>>;

const deletePivotCoursesWithStudents = async (ids: number[]) => {
  try {
    return await supabase.from("courses_students").delete().in("id", ids);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error Delete Courses Students ID");
  }
};

const deletePivotCoursesWithTeachers = async (ids: number[]) => {
  try {
    return await supabase.from("courses_teachers").delete().in("id", ids);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error Delete Courses Teachers ID");
  }
};

export {
  createCourse,
  updateCourse,
  createPivotCoursesWithCategories,
  createPivotCoursesWithStudents,
  createPivotCoursesWithTeachers,
  createPivotCoursesWithResources,
  deletePivotCoursesWithResources,
  getCourseById,
  deletePivotCoursesWithStudents,
  deletePivotCoursesWithTeachers,
  deletePivotCoursesWithCategories,
};
